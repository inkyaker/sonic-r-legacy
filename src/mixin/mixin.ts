/*
    Copyright 2026 nadia8666

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

/** biome-ignore-all lint/correctness/noUnusedVariables: <used> */
import type ts from "typescript";

// Module provides functions that "mixin" to base types through a transformer.
// Module does not exist in the main system as it exports nothing, purely exists for transformer functions.

type Property = ts.SyntaxKind.PropertyAccessExpression;
type Call = ts.SyntaxKind.CallExpression;
type New = ts.SyntaxKind.NewExpression;
type Binary = ts.SyntaxKind.BinaryExpression;

interface i<Text extends string> {
	kind: ts.SyntaxKind.Identifier;
	text: Text;
}

interface VectorAxis<Axis extends "X" | "Y" | "Z"> {
	kind: Property;
	expression: 0;
	name: i<Axis>;
}

interface LimitDistance {
    kind: Binary;
    operatorToken: ts.SyntaxKind.BarBarToken;
    left: {
        kind: Binary;
        operatorToken: ts.SyntaxKind.AmpersandAmpersandToken;
        left: {
            kind: Binary;
            operatorToken: ts.SyntaxKind.EqualsEqualsEqualsToken;
            left: {
                kind: Property;
                expression: 0;
                name: i<"Magnitude">;
            };
            right: {
                kind: ts.SyntaxKind.NumericLiteral;
                value: 0;
            };
        };
        right: 0;
    };
    right: {
        kind: Call;
        expression: {
            kind: Property;
            expression: {
                kind: Property;
                expression: 0;
                name: i<"Unit">;
            };
            name: i<"mul">;
        };
        arguments: [
            {
                kind: Call;
                expression: {
                    kind: Property;
                    expression: i<"math">;
                    name: i<"min">;
                };
                arguments: [
                    {
                        kind: Property;
                        expression: 0;
                        name: i<"Magnitude">;
                    },
                    1
                ];
            }
        ];
    };
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

		/** @metadata ast-macro {@link LimitDistance ast-macro-target} */
        LimitDistance(this: Vector3, Distance: number): Vector3;
	}

	interface Vector2 {
		/** @metadata ast-macro {@link VecDist ast-macro-target} */
		Distance(this: Vector2, To: Vector2): number;
	}

	interface CFrameConstructor {
		fromRotationBetweenVectors(this: void, From: Vector3, To: Vector3): CFrame;
	}
}
