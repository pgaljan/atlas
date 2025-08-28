import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'admin', description: 'Administrator role with full permissions' },
    { name: 'user', description: 'Standard user role with limited access' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role?.name },
      update: { description: role?.description },
      create: { name: role?.name, description: role?.description },
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
}

main()
  .catch((e) => {
    console.error(' Seeding error: ', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
