import type ts from "typescript"

// Module provides functions that "mixin" to base types through a transformer.
// Module does not exist in the main system as it exports nothing, purely exists for transformer functions.

type Property = ts.SyntaxKind.PropertyAccessExpression
type Call = ts.SyntaxKind.CallExpression

interface i<Text extends string> {
    kind: ts.SyntaxKind.Identifier
    text: Text
}

interface ModelPos<Index> {
    kind: Property
    expression: {
        kind: Call
        expression: {
            kind: Property
            expression: Index
            name: i<"GetPivot">
        }
    }
    name: i<"Position">
}

interface SubVecs<VecA, VecB> {
    arguments: [VecB]
    kind: Call
    expression: {
        kind: Property
        expression: VecA
        name: i<"sub">
    }
}

interface ModelDistance {
    kind: Property
    argumentList: true
    arguments: true
    expression: SubVecs<ModelPos<0>, ModelPos<1>>
    name: i<"Magnitude">
}

interface VecDist {
    kind: Property
    argumentList: true
    arguments: true
    expression: SubVecs<0, 1>
    name: i<"Magnitude">
}

declare global {
    interface Model {
        /** @metadata ast-macro {@link ModelDistance ast-macro-target} */
        Distance(this: Model, To: Model): number
    }

    interface Vector3 {
        /** @metadata ast-macro {@link VecDist ast-macro-target} */
        Distance(this: Vector3, To: Vector3): number
    }

    interface Vector2 {
        /** @metadata ast-macro {@link VecDist ast-macro-target} */
        Distance(this: Vector2, To: Vector2): number
    }
}