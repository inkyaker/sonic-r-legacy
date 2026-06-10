/** biome-ignore-all lint/correctness/noUnusedVariables: <used> */
import type ts from "typescript";

// Module provides functions that "mixin" to base types through a transformer.
// Module does not exist in the main system as it exports nothing, purely exists for transformer functions.

type Property = ts.SyntaxKind.PropertyAccessExpression;
type Call = ts.SyntaxKind.CallExpression;
type New = ts.SyntaxKind.NewExpression;

interface i<Text extends string> {
	kind: ts.SyntaxKind.Identifier;
	text: Text;
}

interface AltVector3Constructor {
	kind: Property;
	expression: i<"Vector3">;
	name: i<"new">;
}

interface VectorAxis<Axis extends "X" | "Y" | "Z"> {
	kind: Property;
	expression: 0;
	name: i<Axis>;
}

interface Vec3WithX {
	kind: New;
	expression: i<"Vector3">;
	arguments: [1, VectorAxis<"Y">, VectorAxis<"Z">];
}

interface Vec3WithY {
	kind: New;
	expression: i<"Vector3">;
	arguments: [VectorAxis<"X">, 1, VectorAxis<"Z">];
}

interface Vec3WithZ {
	kind: New;
	expression: i<"Vector3">;
	arguments: [VectorAxis<"X">, VectorAxis<"Y">, 1];
}

interface ModelPos<Index> {
	kind: Property;
	expression: {
		kind: Call;
		expression: {
			kind: Property;
			expression: Index;
			name: i<"GetPivot">;
		};
	};
	name: i<"Position">;
}

interface SubVecs<VecA, VecB> {
	arguments: [VecB];
	kind: Call;
	expression: {
		kind: Property;
		expression: VecA;
		name: i<"sub">;
	};
}

interface ModelDistance {
	kind: Property;
	argumentList: true;
	arguments: true;
	expression: SubVecs<ModelPos<0>, ModelPos<1>>;
	name: i<"Magnitude">;
}

interface VecDist {
	kind: Property;
	argumentList: true;
	arguments: true;
	expression: SubVecs<0, 1>;
	name: i<"Magnitude">;
}

declare global {
	interface Model {
		/** @metadata ast-macro {@link ModelDistance ast-macro-target} */
		Distance(this: Model, To: Model): number;
	}

	interface Vector3 {
		/** @metadata ast-macro {@link VecDist ast-macro-target} */
		Distance(this: Vector3, To: Vector3): number;

		/** @metadata ast-macro {@link Vec3WithX ast-macro-target} */
		WithX(this: Vector3, X: number): Vector3;

		/** @metadata ast-macro {@link Vec3WithY ast-macro-target} */
		WithY(this: Vector3, Y: number): Vector3;

		/** @metadata ast-macro {@link Vec3WithZ ast-macro-target} */
		WithZ(this: Vector3, Z: number): Vector3;
	}

	interface Vector2 {
		/** @metadata ast-macro {@link VecDist ast-macro-target} */
		Distance(this: Vector2, To: Vector2): number;
	}

	interface CFrameConstructor {
		fromRotationBetweenVectors(this: void, From: Vector3, To: Vector3): CFrame;
	}
}
