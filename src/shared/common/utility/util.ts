export function NumCompare<T, U>(ValueCheck:boolean, TrueValue:T, FalseValue:U) {
    if (ValueCheck) {
        return TrueValue
    } else {
        return FalseValue
    }
}