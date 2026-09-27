// Module-level restaurant list so the Restaurants home, detail page, and
// create flow share the same data within a session (mock data has no backend).
// Pages mirror it into local state for rendering; all mutations go through
// the helpers below so create → view → edit → delete stay consistent.
import { mockRestaurants } from './mockData';
import { Restaurant, Branch } from '../types/admin';

let restaurants: Restaurant[] = [...mockRestaurants];

export function getRestaurants(): Restaurant[] {
  return restaurants;
}

export function setRestaurants(next: Restaurant[]): void {
  restaurants = next;
}

export function addRestaurant(rest: Restaurant): void {
  restaurants = [rest, ...restaurants];
}

export function updateRestaurant(id: string, patch: Partial<Restaurant>): void {
  restaurants = restaurants.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

export function deleteRestaurant(id: string): void {
  restaurants = restaurants.filter((r) => r.id !== id);
}

export function addBranch(restaurantId: string, branch: Branch): void {
  restaurants = restaurants.map((r) =>
    r.id === restaurantId ? { ...r, branches: [...r.branches, branch] } : r
  );
}
