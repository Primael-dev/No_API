const prisma = require('../prisma');

const getProfile = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailVerifiedAt: true,
      twoFactorEnabledAt: true,
      disabledAt: true,
    },
  });
};

const updateProfile = async (userId, firstName, lastName) => {
  return prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailVerifiedAt: true,
      twoFactorEnabledAt: true,
      disabledAt: true,
    },
  });
};

const deleteAccount = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: { disabledAt: new Date() },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      disabledAt: true
    },
  });
};

const getLoginHistory = async (userId) => {
  return prisma.loginHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  getLoginHistory
};