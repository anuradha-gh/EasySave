/** A user's profile stored in the `profiles` table. */
export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

/** A savings goal stored in the `goals` table. */
export interface Goal {
  id: string;
  user_id: string;
  target_amount: number;
  total_days: number;
  min_base: number;
  currency: string;
  /** Array of daily saving amounts whose sum equals `target_amount`. */
  grid: number[];
  /** Parallel boolean array tracking which tiles the user has checked off. */
  checked_tiles: boolean[];
  created_at: string;
}

/** Configuration passed to the grid-generation algorithm. */
export interface GridConfig {
  targetAmount: number;
  totalDays: number;
  minBase: number;
}
