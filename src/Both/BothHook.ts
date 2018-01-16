let hooksRouter: ((data) => (Promise<void> | void))[] = [];
export const getHooksRouter = () => hooksRouter;

export const RegisterHookRouter: any = () => {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<(data) => Promise<object> | object>): any => {
    getHooksRouter().push(descriptor.value as any);
  }
}