import type { Renderer } from "../renderer";

export class RenderPart {
	public Model!: Model;
	public Visible = false;

	// biome-ignore lint/complexity/noUselessConstructor: <required>
	// biome-ignore lint/correctness/noUnusedFunctionParameters: <required>
	constructor(Renderer: Renderer, Parent: Instance) {}

	public Destroy() {}
}
