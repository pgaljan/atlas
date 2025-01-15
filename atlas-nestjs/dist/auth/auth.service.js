"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(jwtService, prismaService) {
        this.jwtService = jwtService;
        this.prismaService = prismaService;
    }
    async logAudit(action, element, elementId, details, userId) {
        await this.prismaService.auditLog.create({
            data: {
                action,
                element,
                elementId: elementId.toString(),
                details: details,
                userId: userId || null,
            },
        });
    }
    async register(registerDto) {
        const { username, email, password, roleName } = registerDto;
        try {
            return await this.prismaService.$transaction(async (prisma) => {
                const existingUser = await prisma.user.findUnique({
                    where: { email },
                });
                if (existingUser) {
                    throw new common_1.ConflictException('User with this email already exists');
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                const role = await prisma.role.findFirst({
                    where: {
                        name: {
                            equals: roleName,
                            mode: 'insensitive',
                        },
                    },
                });
                if (!role) {
                    throw new common_1.ConflictException('Role not found');
                }
                const newUser = await prisma.user.create({
                    data: {
                        username,
                        email,
                        password: hashedPassword,
                        roleId: role.id,
                    },
                });
                const freePlan = await prisma.plan.findFirst({
                    where: { name: 'Personal' },
                });
                if (!freePlan) {
                    throw new common_1.ConflictException('Free plan not found');
                }
                const subscriptionEndDate = new Date();
                subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
                await prisma.subscription.create({
                    data: {
                        userId: newUser.id,
                        planId: freePlan.id,
                        features: freePlan.features,
                        startDate: new Date(),
                        endDate: subscriptionEndDate,
                        status: 'active',
                    },
                });
                const payload = { email: newUser.email, sub: newUser.id };
                await this.logAudit('User Registration', 'User', newUser.id, {
                    username,
                    email,
                });
                return { user: payload };
            });
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred during registration');
        }
    }
    async validateUser(email, password) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (user.deletedAt) {
                throw new common_1.ConflictException('This account has been deactivated');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            return isPasswordValid ? user : null;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred while validating user credentials');
        }
    }
    async login(user) {
        try {
            const payload = { email: user.email, sub: user.id };
            const accessToken = this.jwtService.sign(payload);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            const existingToken = await this.prismaService.token.findUnique({
                where: {
                    userId_key: {
                        userId: user.id,
                        key: 'access_token',
                    },
                },
            });
            if (existingToken) {
                await this.prismaService.token.update({
                    where: { id: existingToken.id },
                    data: { value: accessToken, expiresAt },
                });
            }
            else {
                await this.prismaService.token.create({
                    data: {
                        userId: user.id,
                        key: 'access_token',
                        value: accessToken,
                        expiresAt,
                    },
                });
            }
            await this.logAudit('User Login', 'User', user.id, { email: user.email });
            return {
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                },
                access_token: accessToken,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('An unexpected error occurred during login');
        }
    }
    async resetPassword(resetPasswordDto) {
        const { email, newPassword } = resetPasswordDto;
        try {
            const user = await this.prismaService.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.prismaService.user.update({
                where: { email },
                data: { password: hashedPassword },
            });
            const existingToken = await this.prismaService.token.findUnique({
                where: {
                    userId_key: {
                        userId: user.id,
                        key: 'access_token',
                    },
                },
            });
            if (existingToken) {
                await this.prismaService.token.update({
                    where: { id: existingToken.id },
                    data: { expiresAt: new Date() },
                });
            }
            const payload = { email: user.email, sub: user.id };
            const newAccessToken = this.jwtService.sign(payload);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            await this.prismaService.token.create({
                data: {
                    userId: user.id,
                    key: 'access_token',
                    value: newAccessToken,
                    expiresAt,
                },
            });
            await this.logAudit('Password Reset', 'User', user.id, {
                email: user.email,
            });
            return {
                message: 'Password reset successfully',
                access_token: newAccessToken,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred during password reset');
        }
    }
    async logout(user) {
        try {
            const existingToken = await this.prismaService.token.findUnique({
                where: {
                    userId_key: {
                        userId: user.id,
                        key: 'access_token',
                    },
                },
            });
            if (existingToken) {
                await this.prismaService.token.update({
                    where: { id: existingToken.id },
                    data: { expiresAt: new Date() },
                });
            }
            await this.logAudit('User Logout', 'User', user.id, {
                email: user.email,
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('An unexpected error occurred during logout');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map