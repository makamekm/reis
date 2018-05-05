export type HookType = (data) => (Promise<void> | void);
let hooksRouter: HookType[] = [];
export const getHooksRouter = () => hooksRouter;

export function RegisterHookRouter(func: HookType) {
  getHooksRouter().push(func);
}