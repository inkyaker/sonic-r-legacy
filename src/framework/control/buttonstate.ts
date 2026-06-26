/**
 * @class
 */
export class ButtonState {
	public DidPress;
	public IsDown;
	public CanBeUpdated;
	private LastActivated;
	public KeyCodes: Enum.KeyCode[];

	constructor(InitialCodes: Enum.KeyCode[], public DisplayName: string) {
		this.DidPress = false;
		this.IsDown = false;
		this.LastActivated = false;
		this.CanBeUpdated = true;
		this.KeyCodes = InitialCodes;
	}

	/**
	 * Updaet button state
	 * @param Activated
	 */
	public Update(Activated: boolean) {
		if (!this.CanBeUpdated) {
			return;
		}

		// Register input for lower game speed
		if (Activated) {
			this.CanBeUpdated = false;
		}

		this.IsDown = Activated;

		if (!this.LastActivated && this.IsDown) {
			this.DidPress = true;
		} else if (this.DidPress) {
			this.DidPress = false;
		}

		this.LastActivated = this.IsDown;
	}
}
