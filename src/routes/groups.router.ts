import express from 'express';
import {
  createGroup,
  deleteGroup,
  getGroup,
  inviteMembersToExistingGroup,
  removeMemberInvitation,
} from '../controllers/group.controller';

const groupsRouter = express.Router();

/* Group Controller */
groupsRouter.post('/', createGroup);
groupsRouter.get('/', getGroup);
groupsRouter.delete('/:groupId', deleteGroup);
groupsRouter.patch('/:groupId/inviteMembers', inviteMembersToExistingGroup);
groupsRouter.patch('/:groupId/removeMemberInvitation', removeMemberInvitation);

export = groupsRouter;
