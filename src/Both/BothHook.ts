export type HookRouterType = (data) => (Promise<void> | void);
let hooksRouter: HookRouterType[] = [];
export const getHooksRouter = () => hooksRouter;
export function RegisterHookRouter(func: HookRouterType) {
  getHooksRouter().push(func);
}

export type BeforeRenderRouterType = (match, location, history) => void;
let beforeRenderRouter: BeforeRenderRouterType[] = [];
export const getBeforeRenderRouter = () => beforeRenderRouter;
export function RegisterBeforeRenderRouter(func: BeforeRenderRouterType) {
  getBeforeRenderRouter().push(func);
}