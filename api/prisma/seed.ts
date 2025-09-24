import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'admin', description: 'Administrator role with full permissions' },
    { name: 'user', description: 'Standard user role with limited access' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
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
    authProviders: {
      local: true,
      google: false,
      github: false,
    },
    smtpSettings: {},
  };

  const existingSettings = await prisma.appSettings.findFirst();

  if (existingSettings) {
    await prisma.appSettings.update({
      where: { id: existingSettings.id },
      data: defaultAppSettings,
    });
  } else {
    await prisma.appSettings.create({
      data: defaultAppSettings,
    });
  }

  const adminEmail = 'test@gmail.com';
  const adminUsername = 'test';
  const adminPassword = '0011';

  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  if (!adminRole) {
    throw new Error(
      'Admin role not found after upsert. Aborting super admin creation.',
    );
  }

  if (!bcrypt || typeof bcrypt.hash !== 'function') {
    throw new Error(
      'bcrypt is not loaded. Ensure bcryptjs is installed and imported with "import * as bcrypt from \'bcryptjs\'".',
    );
  }
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
        roles: {
          connect: { id: adminRole.id },
        },
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
        roles: {
          connect: { id: adminRole.id },
        },
      },
    });
    console.log('Created super admin user:', adminEmail);
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!adminUser) {
    throw new Error('Admin user not found after create/update.');
  }

  const workspaceName = `${adminUsername}'s Workspace`;
  let workspace = await prisma.workspace.findFirst({
    where: { name: workspaceName },
  });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
      },
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

  const businessPlan = await prisma.plan.findFirst({
    where: { name: 'Business' },
  });
  if (!businessPlan) {
    throw new Error(
      'Business plan not found. Ensure plans seeding ran before subscription upsert.',
    );
  }

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
  console.log('Upserted subscription for admin user.');

  const existingKey = await prisma.apiKey.findFirst({
    where: { userId: adminUser.id },
  });
  if (!existingKey) {
    const apiKeyValue = randomBytes(24).toString('hex');
    await prisma.apiKey.create({
      data: {
        key: apiKeyValue,
        userId: adminUser.id,
      },
    });
    // console.log('Created API key for admin user.');
  } else {
    // console.log('API key already exists for admin user.');
  }
}

main()
  .catch((e) => {
    console.error(' Seeding error: ', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
