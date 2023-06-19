import {
  createGroup,
  deleteGroup,
  getGroup,
  inviteMembersToExistingGroup,
  removeMemberInvitation,
} from '../controllers/group.controller';
import express from 'express';

const groupsRouter = express.Router();

/* Group Controller */
groupsRouter.post('/', createGroup);
groupsRouter.get('/', getGroup);
groupsRouter.delete('/:groupId', deleteGroup);
groupsRouter.patch('/:groupId/invite-members', inviteMembersToExistingGroup);
groupsRouter.patch('/:groupId/remove-member-invitation', removeMemberInvitation);

export = groupsRouter;
