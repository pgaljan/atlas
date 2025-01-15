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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserById(id) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${id} not found`);
            }
            return user;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to fetch user with ID ${id}: ${error.message}`);
        }
    }
    async updateUser(id, updateUserDto, userId) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw new common_1.NotFoundException(`User with ID ${id} not found`);
            }
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: updateUserDto,
            });
            await this.prisma.auditLog.create({
                data: {
                    action: 'User update',
                    element: 'User',
                    details: JSON.stringify(updateUserDto),
                    userId: userId,
                },
            });
            return updatedUser;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to update user with ID ${id}: ${error.message}`);
        }
    }
    async deleteUser(id, reason, userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${id} not found`);
            }
            await this.prisma.auditLog.create({
                data: {
                    action: 'User soft delete',
                    element: 'User',
                    details: JSON.stringify({ reason }),
                    userId: userId,
                },
            });
            return await this.prisma.user.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete user with ID ${id}: ${error.message}`);
        }
    }
    async changePassword(id, oldPassword, newPassword, userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${id} not found`);
            }
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                throw new common_1.ForbiddenException('Old password is incorrect');
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: { password: hashedNewPassword },
            });
            await this.prisma.auditLog.create({
                data: {
                    action: 'Password change',
                    element: 'User',
                    details: JSON.stringify({ changedFields: ['password'] }),
                    userId: userId,
                },
            });
            return updatedUser;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to change password for user with ID ${id}: ${error.message}`);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map