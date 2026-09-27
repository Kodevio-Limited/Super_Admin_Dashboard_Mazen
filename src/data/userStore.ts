// Module-level user list so the Users page and its modals share data
// within a session (mock data has no backend).
import { mockUsers } from './mockData';
import { AdminUser } from '../types/admin';

let users: AdminUser[] = [...mockUsers];

export function getUsers(): AdminUser[] {
  return users;
}

export function setUsers(next: AdminUser[]): void {
  users = next;
}

export function addUser(user: AdminUser): void {
  users = [user, ...users];
}

export function updateUser(id: string, patch: Partial<AdminUser>): void {
  users = users.map((u) => (u.id === id ? { ...u, ...patch } : u));
}

export function deleteUser(id: string): void {
  users = users.filter((u) => u.id !== id);
}
