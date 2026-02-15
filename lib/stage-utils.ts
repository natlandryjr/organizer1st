/**
 * Compute stage dimensions proportional to the number of attendees.
 * Larger audiences get a larger stage.
 */
export function stageDimensionsForCapacity(
  totalSeats: number,
  gridCols: number = 24,
  gridRows: number = 48
): { width: number; height: number } {
  const width = Math.min(
    gridCols,
    Math.max(8, Math.floor(totalSeats / 10))
  );
  const height = Math.min(
    Math.floor(gridRows * 0.4),
    Math.max(4, Math.floor(totalSeats / 15))
  );
  return { width, height };
}
