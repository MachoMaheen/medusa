/**
 * Barrel for the Happilee Toaster wrapper.
 *
 * Consumers should import EVERYTHING toast-related from this module so the
 * sonner dependency is encapsulated and we can swap implementations later
 * without a codemod across the dashboard:
 *
 *   import { toast, HappileeToaster } from "@/components/common/happilee-toaster"
 */

export { HappileeToaster, toast } from "./happilee-toaster"
export type { HappileeToasterProps } from "./happilee-toaster"
