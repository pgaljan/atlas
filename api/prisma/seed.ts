import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'admin', description: 'Administrator role with full permissions' },
    {
      name: 'success_manager',
      description: 'Success Manager (platform oversight)',
    },
    { name: 'coach', description: 'Coach (domain expert)' },
    { name: 'recruiter', description: 'Recruiter (talent acquisition)' },
    { name: 'learner', description: 'Learner (end user)' },
    { name: 'user', description: 'Standard user role' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
  }

  const permissions = [
    { name: 'profile:read:own', description: 'Read own profile' },
    { name: 'profile:read:all', description: 'Read all profiles' },
    { name: 'profile:write:own', description: 'Write own profile' },
    { name: 'profile:write:all', description: 'Write any profile' },
    { name: 'profile:linkedin:connect', description: 'Connect LinkedIn' },
    { name: 'profile:resume:upload', description: 'Upload resume' },
    {
      name: 'opportunities:create:own',
      description: 'Create own opportunities',
    },
    { name: 'projects:manage:own', description: 'Manage own projects' },
    {
      name: 'documents:generate:own',
      description: 'Generate documents for own profile',
    },
    {
      name: 'sessions:manage:assigned',
      description: 'Manage assigned sessions (coach)',
    },
    { name: 'platform:metrics:read', description: 'Read platform metrics' },
    { name: 'users:manage:all', description: 'Manage users (admin)' },
    { name: 'recruitment:manage', description: 'Manage recruitment' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: { description: p.description },
      create: { name: p.name, description: p.description },
    });
  }

  const map: Record<string, string[]> = {
    admin: [
      'users:manage:all',
      'profile:read:all',
      'profile:write:all',
      'platform:metrics:read',
    ],
    success_manager: ['platform:metrics:read', 'profile:read:all'],
    coach: ['sessions:manage:assigned', 'profile:read:own', 'profile:read:all'],
    recruiter: ['recruitment:manage', 'profile:read:all'],
    learner: [
      'profile:read:own',
      'profile:write:own',
      'opportunities:create:own',
      'documents:generate:own',
      'projects:manage:own',
    ],
    user: ['profile:read:own'],
  };

  for (const [roleName, permNames] of Object.entries(map)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;
    for (const pname of permNames) {
      const perm = await prisma.permission.findUnique({
        where: { name: pname },
      });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id,
          } as any,
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: perm.id,
        },
      });
    }
  }

  const plans = [
    {
      name: 'Personal',
      description: 'Basic plan for individuals',
      price: 0,
      order: 1,
      features: {
        Structures: '5',
        'Dynamic WBS': false,
        'Record Tagging': false,
        'Import from Excel': true,
        'Rich Text Records': true,
        'Export to HTML/Markdown': true,
        'Structure Backup/Restore': false,
        'Interactive structure map': true,
        'Export to DOC/PDF': false,
      },
    },
    {
      name: 'Educator',
      description: 'Plan for educators',
      price: 5,
      order: 2,
      features: {
        Structures: '50',
        'Dynamic WBS': false,
        'Record Tagging': false,
        'Import from Excel': true,
        'Rich Text Records': true,
        'Export to HTML/Markdown': true,
        'Structure Backup/Restore': true,
        'Interactive structure map': true,
        'Export to DOC/PDF': false,
      },
    },
    {
      name: 'Business',
      description: 'Premium plan for businesses',
      price: 15,
      order: 3,
      features: {
        Structures: 'Unlimited',
        'Dynamic WBS': true,
        'Record Tagging': true,
        'Import from Excel': true,
        'Rich Text Records': true,
        'Export to HTML/Markdown': true,
        'Structure Backup/Restore': true,
        'Interactive structure map': true,
        'Export to DOC/PDF': true,
      },
    },
    {
      name: 'Analyst',
      description: 'Advanced plan for analysts',
      price: 10,
      order: 4,
      features: {
        Structures: 'Unlimited',
        'Dynamic WBS': false,
        'Record Tagging': true,
        'Import from Excel': true,
        'Rich Text Records': true,
        'Export to HTML/Markdown': true,
        'Structure Backup/Restore': true,
        'Interactive structure map': true,
        'Export to DOC/PDF': true,
      },
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({
      where: { name: plan.name },
    });
    if (existing) {
      await prisma.plan.update({
        where: { id: existing.id },
        data: {
          description: plan.description,
          price: plan.price,
          features: plan.features as any,
          order: plan.order,
        },
      });
    } else {
      await prisma.plan.create({
        data: {
          name: plan.name,
          description: plan.description,
          price: plan.price,
          features: plan.features as any,
          order: plan.order,
        },
      });
    }
  }

  const defaultAppSettings = {
    appName: 'Atlas',
    primaryColor: '#660000',
    secondaryColor: '#006666',
    inviteCodeOption: 'disabled',
    authProviders: { local: true, google: false, github: false },
    smtpSettings: {},
  };

  const existingSettings = await prisma.appSettings.findFirst();
  if (existingSettings) {
    await prisma.appSettings.update({
      where: { id: existingSettings.id },
      data: defaultAppSettings,
    });
  } else {
    await prisma.appSettings.create({ data: defaultAppSettings });
  }

  // super admin user — safe idempotent upsert
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'test@gmail.com';
  const adminUsername = process.env.SEED_ADMIN_USERNAME || 'test';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || '0011';

  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  if (!adminRole) throw new Error('Admin role not found after upsert.');

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (existingAdminUser) {
    await prisma.user.update({
      where: { id: existingAdminUser.id },
      data: {
        username: adminUsername,
        password: hashedPassword,
        isAdmin: true,
        roleId: adminRole.id,
        roles: { connect: { id: adminRole.id } },
      },
    });
    console.log('Updated existing super admin user:', adminEmail);
  } else {
    await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        displayName: 'Super Admin',
        isAdmin: true,
        roleId: adminRole.id,
        roles: { connect: { id: adminRole.id } },
      },
    });
    console.log('Created super admin user:', adminEmail);
  }

  // create workspace for admin if required
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!adminUser) throw new Error('Admin user not found after create/update.');

  const workspaceName = `${adminUsername}'s Workspace`;
  let workspace = await prisma.workspace.findFirst({
    where: { name: workspaceName },
  });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { name: workspaceName },
    });
    console.log('Created default workspace for admin.');
  }

  if (adminUser.defaultWorkspaceId !== workspace.id) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { defaultWorkspaceId: workspace.id },
    });
    console.log('Set defaultWorkspaceId for admin user.');
  }

  // subscription upsert
  const businessPlan = await prisma.plan.findFirst({
    where: { name: 'Business' },
  });
  if (!businessPlan) throw new Error('Business plan not found.');

  const subEndDate = new Date('2099-12-31T23:59:59.999Z');
  await prisma.subscription.upsert({
    where: { userId: adminUser.id },
    update: {
      planId: businessPlan.id,
      features: businessPlan.features as any,
      startDate: new Date(),
      endDate: subEndDate,
      status: 'active',
    },
    create: {
      userId: adminUser.id,
      planId: businessPlan.id,
      features: businessPlan.features as any,
      startDate: new Date(),
      endDate: subEndDate,
      status: 'active',
    },
  });

  const existingKey = await prisma.apiKey.findFirst({
    where: { userId: adminUser.id },
  });
  if (!existingKey) {
    const apiKeyValue = randomBytes(24).toString('hex');
    await prisma.apiKey.create({
      data: { key: apiKeyValue, userId: adminUser.id },
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Seeding error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
