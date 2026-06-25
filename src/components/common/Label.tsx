
type LabelProps = {
    label: string,
}

export default function Label({ label }: LabelProps) {
    return (
        <>
            <label> {label} </label>
        </>
    );
}