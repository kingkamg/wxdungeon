class Capsule extends Item {
	public constructor(type: string) {
		super(type);
	}

	public isAutoPicking(): boolean {
		return false;
	}

	public use(): void {
		Logic.eventHandler.dispatchEventWith(LogicEvent.DAMAGE_PLAYER, false, { damage: -1 });

	}

	public taken(finish): boolean {
		if (super.taken(finish)) {
			//tile所在的dungeon发消息
			return true;
		}
		return false;
	}
}