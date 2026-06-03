import { supabase } from './supabase';
import type { Goal, UserProfile } from './types';

/**
 * Insert a new savings goal for a user.
 *
 * `checked_tiles` is initialised to an array of `false` values matching the
 * length of `grid`.
 *
 * @returns The newly created {@link Goal}, or `null` if the insert failed.
 */
export async function saveGoal(
  userId: string,
  targetAmount: number,
  totalDays: number,
  minBase: number,
  grid: number[],
): Promise<Goal | null> {
  try {
    const checkedTiles: boolean[] = new Array(grid.length).fill(false);

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        target_amount: targetAmount,
        total_days: totalDays,
        min_base: minBase,
        grid,
        checked_tiles: checkedTiles,
      })
      .select()
      .single();

    if (error) {
      console.error('[saveGoal] Supabase error:', error.message);
      return null;
    }

    return data as Goal;
  } catch (err) {
    console.error('[saveGoal] Unexpected error:', err);
    return null;
  }
}

/**
 * Fetch the most recently created goal for a user.
 *
 * @returns The active {@link Goal}, or `null` if none exists.
 */
export async function getActiveGoal(userId: string): Promise<Goal | null> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // PGRST116 = "no rows returned" — not a real error for this use-case
      if (error.code === 'PGRST116') return null;
      console.error('[getActiveGoal] Supabase error:', error.message);
      return null;
    }

    return data as Goal;
  } catch (err) {
    console.error('[getActiveGoal] Unexpected error:', err);
    return null;
  }
}

/**
 * Persist the current checked-tile state for a goal.
 */
export async function updateCheckedTiles(
  goalId: string,
  checkedTiles: boolean[],
): Promise<void> {
  try {
    const { error } = await supabase
      .from('goals')
      .update({ checked_tiles: checkedTiles })
      .eq('id', goalId);

    if (error) {
      console.error('[updateCheckedTiles] Supabase error:', error.message);
    }
  } catch (err) {
    console.error('[updateCheckedTiles] Unexpected error:', err);
  }
}

/**
 * Delete a single goal by its ID.
 */
export async function deleteGoal(goalId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      console.error('[deleteGoal] Supabase error:', error.message);
    }
  } catch (err) {
    console.error('[deleteGoal] Unexpected error:', err);
  }
}

/**
 * Fetch a user profile by ID.
 *
 * @returns The {@link UserProfile}, or `null` if not found.
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[getProfile] Supabase error:', error.message);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error('[getProfile] Unexpected error:', err);
    return null;
  }
}

/**
 * Insert a profile if it doesn't exist, or update it if it does.
 *
 * Uses Supabase's `upsert` with `id` as the conflict column.
 */
export async function upsertProfile(
  userId: string,
  email: string,
  displayName: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, email, display_name: displayName },
        { onConflict: 'id' },
      );

    if (error) {
      console.error('[upsertProfile] Supabase error:', error.message);
    }
  } catch (err) {
    console.error('[upsertProfile] Unexpected error:', err);
  }
}

/**
 * Update only the display name on an existing profile.
 */
export async function updateDisplayName(
  userId: string,
  name: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', userId);

    if (error) {
      console.error('[updateDisplayName] Supabase error:', error.message);
    }
  } catch (err) {
    console.error('[updateDisplayName] Unexpected error:', err);
  }
}

/**
 * Delete **all** goals and the profile row for a given user.
 *
 * Goals are deleted first to avoid any FK constraint issues.
 */
export async function deleteUserData(userId: string): Promise<void> {
  try {
    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', userId);

    if (goalsError) {
      console.error('[deleteUserData] Failed to delete goals:', goalsError.message);
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('[deleteUserData] Failed to delete profile:', profileError.message);
    }
  } catch (err) {
    console.error('[deleteUserData] Unexpected error:', err);
  }
}
