export interface Job {
    cronTime: string
    onTick(previous: Date | null): Promise<boolean>
    cronJob?: any | null
    current?: Date | null
    currentTick?: Promise<boolean>
}

export interface WorkerOption {
    name: string
    scope?: string
    cronTime: string
}