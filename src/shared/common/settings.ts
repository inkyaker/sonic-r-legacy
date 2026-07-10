import { Modding, Reflect } from "@flamework/core";

// category
const C = Modding.createDecorator<[string, number, number]>("Property", (Descriptor, [Category, Order, CategoryOrder]) => {
	Reflect.defineMetadataBatch(
		Descriptor.object,
		{
			Category: Category,
			Order: Order,
			CategoryOrder: CategoryOrder,
		},
		Descriptor.property,
	);
});

// display config
const c = Modding.createDecorator<[string, "Toggle" | "Carousel" | "Slider"]>("Property", (Descriptor, [DisplayName, Type]) => {
	Reflect.defineMetadataBatch(
		Descriptor.object,
		{
			DisplayName: DisplayName,
			Type: Type,
		},
		Descriptor.property,
	);
});

const SliderConf = Modding.createDecorator<[number, number, number, ((Value: number) => string) | undefined]>("Property", (Descriptor, [Min, Max, Increment, DisplayFunc]) => {
	Reflect.defineMetadataBatch(
		Descriptor.object,
		{
			SliderMin: Min,
			SliderMax: Max,
			SliderInc: Increment,
			SliderFunc: DisplayFunc,
		},
		Descriptor.property,
	);
});

const CarouselConf = Modding.createDecorator<[string[]]>("Property", (descriptor, [Options]) => {
	Reflect.defineMetadata(descriptor.object, "CarouselOptions", Options, descriptor.property);
});

export class SettingsData {
	@C("Audio", 10, 1) @c("Music Vol.", "Slider") @SliderConf(0, 1, 0.05, undefined) public MusicVolume = 0.2;
	@C("Audio", 11, 1) @c("UI Volume", "Slider") @SliderConf(0, 1, 0.05, undefined) public UIVolume = 1;
	@C("Audio", 20, 1) @c("SFX Volume", "Slider") @SliderConf(0, 1, 0.05, undefined) public SFXVolume = 1;
	@C("Audio", 30, 1) @c("Object Vol.", "Slider") @SliderConf(0, 1, 0.05, undefined) public ObjectSFXVolume = 1;
	@C("Audio", 40, 1) @c("Footstep Vol.", "Slider") @SliderConf(0, 1, 0.05, undefined) public FootstepVolume = 0.5;
	@C("Audio", 50, 1) @c("Other Plr. Vol.", "Slider") @SliderConf(0, 1, 0.05, undefined) public OtherPlayerVolume = 0.35;
	@C("Audio", 60, 1) @c("Homing Ind. SFX", "Carousel") @CarouselConf(["SXSG", "Unleashed"]) public HomingLockSound: "SXSG" | "Unleashed" = "SXSG";
	@C("Audio", 61, 1) @c("	+ SFX. Enabled", "Toggle") public HomingLockSoundEnabled = true;

	@C("Control", 10, 2) @c("Mouse Sens.", "Slider") @SliderConf(0, 2, 0.05, undefined) public MouseCameraSensitivity = 1;
	@C("Control", 20, 2) @c("Stick Sens.", "Slider") @SliderConf(0, 2, 0.05, undefined) public ControllerCameraSensitivity = 1;
	@C("Control", 30, 2) @c("Touch Sens.", "Slider") @SliderConf(0, 2, 0.05, undefined) public TouchCameraSensitivity = 1;
	@C("Control", 40, 2) @c("L Stick Deadzone", "Slider") @SliderConf(0, 1, 0.05, undefined) public Thumbstick1Deadzone = 0.15;
	@C("Control", 50, 2) @c("R Stick Deadzone", "Slider") @SliderConf(0, 1, 0.05, undefined) public Thumbstick2Deadzone = 0.15;

	@C("Visual", 10, 3) @c("Jump Ball Style", "Carousel") @CarouselConf(["New", "Old"]) public JumpBallStyle: "New" | "Old" = "New";
	@C("Visual", 20, 3) @c("Homing Ind. Enabled", "Toggle") public HomingIndicatorEnabled = true;

	@C("Visual+", 10, 4) @c("Jump Ball Enabled", "Toggle") public JumpBallEnabled = true;
	@C("Visual+", 20, 4) @c("Boost Aura Enabled", "Toggle") public BoostAuraEnabled = true;
	@C("Visual+", 30, 4) @c("Dash Trail Enabled", "Toggle") public DashTrailEnabled = true;
	@C("Visual+", 40, 4) @c("Stomp VFX Enabled", "Toggle") public StompEffectsEnabled = true;
	@C("Visual+", 41, 4) @c("	+ Land VFX Enabled", "Toggle") public StompLandEffectEnabled = true;
	@C("Visual+", 50, 4) @c("Slide VFX Enabled", "Toggle") public SlideEffectsEnabled = true;
	@C("Visual+", 60, 4) @c("Grind VFX Enabled", "Toggle") public GrindEffectsEnabled = true;
}

const SettingsInstance = new SettingsData();
export const SettingsKeys = Reflect.getProperties(SettingsInstance);
export function GetMeta<T>(MetaKey: string, Key: string) {
	return Reflect.getMetadata(SettingsInstance, MetaKey, Key)! as T;
}

SettingsKeys.sort((A, B) => (GetMeta("Order", A) as number) < (GetMeta("Order", B) as number));

export const ReformattedSettingsData = {} as unknown as {
	[K in keyof SettingsData]: SettingsData[K];
};

export const SettingsCategories: string[] = [];

SettingsKeys.forEach((Prop) => {
	ReformattedSettingsData[Prop as never] = SettingsInstance[Prop as keyof SettingsData] as never;

	const Category = GetMeta<string>("Category", Prop);
	if (SettingsCategories.includes(Category)) return;

	SettingsCategories.push(Category);
});
