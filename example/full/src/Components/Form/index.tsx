import * as React from 'react';
import { SliderPicker, CirclePicker } from 'react-color';

import { Input, InputProps, InputSize, InputType, Select, InputSelect, SelectSize, InputSelectSize, SelectFile, SelectFileSize } from '../Input';
import { Popup } from '../Popup';
import { Icon } from '../Icon';

export * from '../Input';

export const InputForm = (props: {
    errors?: string[]
    linkValue: {
        set(value: string): void
        get(): string
    }
    addon?: string
    icon?: string
    placeholder: string
    label?: string
    className?: string
    size?: InputSize
    type?: InputType
    disabled?: boolean
    id?: string
    onEnterKey?: (e: React.KeyboardEvent<HTMLInputElement>) => Promise<void>
}) => <div className={props.className || ''}>
    {props.label && <div className="text left regular sub mb-2">
        {props.label}
    </div>}
    <Popup type="error" position="top center" openOnOverMove closeOnOutClick closeOnOutMove timeout={300} isHidden={!props.errors || props.errors.length == 0} element={
        popup => <Input id={props.id} ref={ref => popup.ref(ref)} onEnterKey={props.onEnterKey} onMouseEnter={() => popup.open()} onMouseLeave={() => popup.close()} onBlur={() => popup.close()} onFocus={() => popup.open()} size={props.size || "sm"} type={props.type || "text"} placeholder={props.placeholder} icon={props.icon} addon={props.addon} error={props.errors && props.errors.length > 0} linkValue={props.linkValue} disabled={props.disabled}/>
    }>
        {props.errors && props.errors.map((message, i) => <div key={i}>{message}</div>)}
    </Popup>
</div>

export const CheckForm = (props: {
    errors?: string[]
    linkValue: {
        set(value: boolean): void
        get(): boolean
    }
    label?: string
    comment?: string
    className?: string
    size?: InputSize
    disabled?: boolean
}) => {
    return <div className={props.className || ''}>
        {props.label && <div className="text regular sub mb-2">
            {props.label}
        </div>}
        <Popup type="error" position="top center" openOnOverMove closeOnOutClick closeOnOutMove timeout={300} isHidden={!props.errors || props.errors.length == 0} element={
            popup => <div ref={ref => popup.ref(ref)} className={"text pointer wrap-" + (props.size || "sm")} onMouseEnter={() => popup.open()} onMouseLeave={() => popup.close()} onClick={e => {
                if (!props.disabled) props.linkValue.set(!props.linkValue.get());
            }}>
                {props.linkValue.get() ? <span className="fa fa-check-square text medium blue"/> : <span className="fa fa-square text medium subsubsub"/>}
                {props.comment && <span className="ml-2">{props.comment}</span>}
            </div>
        }>
            {props.errors && props.errors.map((message, i) => <div key={i}>{message}</div>)}
        </Popup>
    </div>
}

export const SelectFileForm = (props: {
    errors?: string[]
    linkValue: {
        set(value: File): void
        get(): File
    }
    addon?: string
    icon?: string
    placeholder: string
    label?: string
    className?: string
    size?: SelectFileSize
    disabled?: boolean
}) => {
    return <div className={props.className || ''}>
        {props.label && <div className="text left regular sub mb-2">
            {props.label}
        </div>}
        <Popup type="error" position="top center" openOnOverMove closeOnOutClick closeOnOutMove timeout={300} isHidden={!props.errors || props.errors.length == 0} element={
            popup => <SelectFile ref={ref => popup.ref(ref)} onMouseEnter={() => popup.open()} onMouseLeave={() => popup.close()} size={props.size || "sm"} placeholder={props.placeholder} icon={props.icon} addon={props.addon} error={props.errors && props.errors.length > 0} linkValue={props.linkValue} disabled={props.disabled}/>
        }>
            {props.errors && props.errors.map((message, i) => <div key={i}>{message}</div>)}
        </Popup>
    </div>
}

export const ColorForm = (props: {
    errors?: string[]
    linkValue: {
        set(value: string): void
        get(): string
    }
    icon?: string
    addon?: string
    placeholder: string
    label?: string
    className?: string
    size?: InputSize
    disabled?: boolean
}) => {
    return <div className={props.className || ''}>
        {props.label && <div className="text left regular sub mb-2">
            {props.label}
        </div>}
        <Popup minWidth="20rem" maxWidth="25rem" type="select" position="bottom center" closeOnOutClick isHidden={props.disabled} element={
            color => <Popup type="error" position="top center" openOnOverMove closeOnOutClick closeOnOutMove timeout={300} isHidden={!props.errors || props.errors.length == 0 || color.isOpen()} element={
                popup => <Input ref={ref => {
                    color.ref(ref);
                    popup.ref(ref);
                }} onBlur={() => popup.close()} onFocus={() => popup.open()} onMouseEnter={() => popup.open()} onMouseLeave={() => popup.close()} size={props.size || "sm"} type={"text"} placeholder={props.placeholder} icon={props.icon} addon={props.addon} error={props.errors && props.errors.length > 0} linkValue={props.linkValue} disabled={props.disabled}/>
            }>
                {props.errors && props.errors.map((message, i) => (
                    <div key={i}>{message}</div>
                ))}
            </Popup>
        }>
            <div className="p-3">
                <div>
                    <CirclePicker color={props.linkValue.get() || ''} onChangeComplete={color => props.linkValue.set(color.hex)}/>
                </div>
                <div className="mt-3">
                    <SliderPicker color={props.linkValue.get() || ''} onChangeComplete={color => props.linkValue.set(color.hex)}/>
                </div>
            </div>
        </Popup>
    </div>
}

export const SelectForm = (props: {
    errors?: string[]
    icon?: string
    placeholder: string
    label?: string
    addon?: string
    className?: string
    size?: SelectSize
    source: (value: string) => Promise<any[]>
    rows: (data: any[], update?: Function) => any
    disabled?: boolean
}) => {
    return <div className={props.className || ''}>
        {props.label && <div className="text left regular sub mb-2">
            {props.label}
        </div>}
        <Popup type="error" position="top center" openOnOverMove closeOnOutClick closeOnOutMove timeout={300} isHidden={!props.errors || props.errors.length == 0} element={
            popup => <Select ref={ref => popup.ref(ref)} onBlur={() => popup.close()} onFocus={() => popup.open()} onMouseEnter={() => popup.open()} onMouseLeave={() => popup.close()} size={props.size || "sm"} placeholder={props.placeholder} icon={props.icon} addon={props.addon} filter error={props.errors && props.errors.length > 0} initOpen source={props.source} rows={props.rows} disabled={props.disabled}/>
        }>
            {props.errors && props.errors.map((message, i) => <div key={i}>{message}</div>)}
        </Popup>
    </div>
}

export const InputSelectForm = (props: {
    errors?: string[]
    linkValue: {
        set(value: string): void
        get(): string
    }
    icon?: string
    addon?: string
    placeholder: string
    label?: string
    type?: InputType
    className?: string
    size?: InputSelectSize
    source: (value: string) => Promise<any[]>
    rows: (data: any[], update?: Function) => any
    onKeyUpEnter?: (e) => void
    disabled?: boolean
}) => {
    return <div className={props.className || ''}>
        {props.label && <div className="text left regular sub mb-2">
            {props.label}
        </div>}
        <Popup type="error" position="top center" openOnOverMove closeOnOutClick closeOnOutMove timeout={300} isHidden={!props.errors || props.errors.length == 0} element={
            popup => <InputSelect ref={ref => popup.ref(ref)} onBlur={() => popup.close()} onFocus={() => popup.open()} onMouseEnter={() => popup.open()} onMouseLeave={() => popup.close()} type={props.type || "text"} size={props.size || "sm"} placeholder={props.placeholder} icon={props.icon} addon={props.addon} filter error={props.errors && props.errors.length > 0} initOpen source={props.source} rows={props.rows} linkValue={props.linkValue} onKeyUpEnter={props.onKeyUpEnter} disabled={props.disabled}/>
        }>
            {props.errors && props.errors.map((message, i) => <div key={i}>{message}</div>)}
        </Popup>
    </div>
}