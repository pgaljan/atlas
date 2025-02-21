import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class FeatureFlagMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('JWT token missing');
    }

    let userId: string;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.sub;
    } catch (error) {
      throw new UnauthorizedException('Invalid JWT token');
    }

    const feature = Array.isArray(req.headers['x-feature'])
      ? req.headers['x-feature'][0]
      : req.headers['x-feature'];

    if (!feature || typeof feature !== 'string') {
      throw new UnauthorizedException(
        'Feature not specified in request or invalid',
      );
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription || subscription.status !== 'active') {
      throw new UnauthorizedException('No active subscription found for user');
    }

    const features =
      typeof subscription.plan.features === 'string'
        ? JSON.parse(subscription.plan.features)
        : subscription.plan.features;

    if (typeof features !== 'object' || Array.isArray(features)) {
      throw new UnauthorizedException('Features list is invalid');
    }

    // Check if the feature exists and is enabled
    if (!(feature in features)) {
      throw new UnauthorizedException(
        `Feature "${feature}" is not available for your plan`,
      );
    }

    // Check if the feature is enabled (true)
    if (!features[feature]) {
      throw new UnauthorizedException(
        `Feature "${feature}" is not enabled for your plan`,
      );
    }

    next();
  }
}
