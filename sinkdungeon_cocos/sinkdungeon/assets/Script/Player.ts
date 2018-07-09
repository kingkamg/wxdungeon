// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import { EventConstant } from './EventConstant';
import HealthBar from './HealthBar';
import Logic from './Logic';
import Dungeon from './Dungeon';
import InventoryData from './Data/InventoryData';
import Equipment from './Equipment/Equipment';
import EquipmentData from './Data/EquipmentData';
import Monster from './Monster';
import Kraken from './Boss/Kraken';
import Shooter from './Building/Shooter';

@ccclass
export default class Player extends cc.Component {

    @property(cc.Vec2)
    pos: cc.Vec2 = cc.v2(4, 4);
    @property(cc.Label)
    label: cc.Label = null;
    @property(HealthBar)
    healthBar: HealthBar = null;
    @property(Shooter)
    shooter: Shooter = null;

    private playerItemSprite: cc.Sprite;
    hairSprite: cc.Sprite = null;
    weaponSprite: cc.Sprite = null;
    helmetSprite: cc.Sprite = null;
    clothesSprite: cc.Sprite = null;
    trousersSprite: cc.Sprite = null;
    glovesSprite: cc.Sprite = null;
    shoesSprite: cc.Sprite = null;
    isMoving = false;
    isAttacking = false;
    private sprite: cc.Node;
    private anim: cc.Animation;
    isDied = false;
    isFall = false;
    health: cc.Vec2 = cc.v2(1, 1);
    baseAttackPoint: number = 1;

    touchedEquipment: Equipment;
    inventoryData: InventoryData;
    recoveryTimeDelay = 0;

    isFaceRight = true;

    attackTarget: cc.Collider;
    rigidbody: cc.RigidBody;


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.isAttacking = false;
        this.inventoryData = Logic.inventoryData;
        this.health = this.inventoryData.getHealth(Logic.playerData.basehealth, Logic.playerData.basehealth.y);
        this.pos = cc.v2(4, 4);
        this.isDied = false;
        this.anim = this.getComponent(cc.Animation);
        this.rigidbody = this.getComponent(cc.RigidBody);
        this.sprite = this.node.getChildByName('sprite');
        this.playerItemSprite = this.sprite.getChildByName('righthand')
            .getChildByName('item').getComponent(cc.Sprite);
        this.hairSprite = this.sprite.getChildByName('body')
            .getChildByName('hair').getComponent(cc.Sprite);
        this.weaponSprite = this.sprite.getChildByName('lefthand')
            .getChildByName('weapon').getComponent(cc.Sprite);
        this.helmetSprite = this.sprite.getChildByName('body')
            .getChildByName('helmet').getComponent(cc.Sprite);
        this.clothesSprite = this.sprite.getChildByName('body')
            .getChildByName('clothes').getComponent(cc.Sprite);
        this.trousersSprite = this.sprite.getChildByName('body')
            .getChildByName('trousers').getComponent(cc.Sprite);
        this.glovesSprite = this.sprite.getChildByName('body')
            .getChildByName('gloves').getComponent(cc.Sprite);
        this.shoesSprite = this.sprite.getChildByName('body')
            .getChildByName('shoes').getComponent(cc.Sprite);

        cc.director.on(EventConstant.INVENTORY_CHANGEITEM
            , (event) => { this.changeItem(event.detail.spriteFrame) });
        cc.director.on(EventConstant.PLAYER_USEITEM
            , (event) => { this.UseItem() });

        cc.director.on(EventConstant.PLAYER_ATTACK
            , (event) => { this.meleeAttack() });

        cc.director.on(EventConstant.PLAYER_TAKEDAMAGE
            , (event) => { this.takeDamage(event.detail.damage) });
        this.updatePlayerPos();

    }
    changeItem(spriteFrame: cc.SpriteFrame) {
        this.playerItemSprite.spriteFrame = spriteFrame;
    }

    changeEquipment(equipType: string, spriteFrame: cc.SpriteFrame) {
        switch (equipType) {
            case 'weapon': this.weaponSprite.spriteFrame = spriteFrame;
                let color1 = cc.color(255, 255, 255).fromHEX(this.inventoryData.weapon.color);
                this.weaponSprite.node.color = color1;
                break;
            case 'helmet': this.helmetSprite.spriteFrame = spriteFrame;
                this.hairSprite.node.opacity = spriteFrame ? 0 : 255;
                let color2 = cc.color(255, 255, 255).fromHEX(this.inventoryData.helmet.color);
                this.helmetSprite.node.color = color2;
                break;
            case 'clothes': this.clothesSprite.spriteFrame = spriteFrame;
                let color3 = cc.color(255, 255, 255).fromHEX(this.inventoryData.clothes.color);
                this.clothesSprite.node.color = color3;
                break;
            case 'trousers': this.trousersSprite.spriteFrame = spriteFrame;
                let color4 = cc.color(255, 255, 255).fromHEX(this.inventoryData.trousers.color);
                this.trousersSprite.node.color = color4;
                break;
            case 'gloves': this.glovesSprite.spriteFrame = spriteFrame;
                let color5 = cc.color(255, 255, 255).fromHEX(this.inventoryData.gloves.color);
                this.glovesSprite.node.color = color5;
                break;
            case 'shoes': this.shoesSprite.spriteFrame = spriteFrame;
                let color6 = cc.color(255, 255, 255).fromHEX(this.inventoryData.shoes.color);
                this.shoesSprite.node.color = color6;
                break;
        }
        this.health = this.inventoryData.getHealth(this.health, Logic.playerData.basehealth.y);
        this.healthBar.refreshHealth(this.health.x, this.health.y);
    }
    updatePlayerPos() {
        this.node.x = this.pos.x * 64 + 32;
        this.node.y = this.pos.y * 64 + 32;
    }
    transportPlayer(pos: cc.Vec2) {
        this.sprite.rotation = 0;
        this.sprite.scale = 1;
        this.sprite.opacity = 255;
        this.sprite.x = 0;
        this.sprite.y = 0;
        this.pos = pos;
        this.changeZIndex(this.pos);
        this.updatePlayerPos();
    }
    changeZIndex(pos: cc.Vec2) {
        this.node.zIndex = 3000 + (9 - pos.y) * 100 + 2;
    }

    meleeAttack() {
        if (this.isAttacking || this.isDied) {
            return;
        }
        this.isAttacking = true;
        this.shooter.fireBullet();
        if (this.anim) {
            let animState = this.anim.play('PlayerMeleeAttack');
            animState.speed = this.inventoryData.getAttackSpeed();
        }
    }
    move(dir: number, pos: cc.Vec2, dt: number) {
        if (this.isDied || this.isFall) {
            return;
        }
        if (this.shooter && !pos.equals(cc.Vec2.ZERO)) {
            this.shooter.hv = cc.v2(pos.x, pos.y);
        }

        let h = pos.x;
        let v = pos.y;
        let absh = Math.abs(h);
        let absv = Math.abs(v);

        let mul = absh > absv ? absh : absv;
        mul = mul == 0 ? 1 : mul;
        let movement = cc.v2(h, v);
        let speed = 200;
        movement = movement.mul(speed);
        this.rigidbody.linearVelocity = movement;
        this.isMoving = h != 0 || v != 0;
        if(this.isMoving){
            this.isFaceRight = h>0;
        }
        if (this.isMoving) {
            if (!this.anim.getAnimationState('PlayerWalk').isPlaying) {
                this.anim.playAdditive('PlayerWalk');
            }
        } else {
            if (this.anim.getAnimationState('PlayerWalk').isPlaying
                && !this.anim.getAnimationState('PlayerMeleeAttack').isPlaying) {
                this.sprite.rotation = 0;
                this.anim.play('PlayerIdle');
            }
        }

        let isDown = dir == 1;
        if (isDown) {
            this.changeZIndex(this.pos);
        }
        //初始速度0.2,最大速度0.05 跨度0.15， 0.05减，最大300%
        // let baseSpeed = 0.2;
        // let action = cc.sequence(cc.moveTo(this.inventoryData.getMoveSpeed(baseSpeed), x, y), finish);
    }
    // move(dir: number) {
    //     if (this.isMoving || this.isDied || this.isFall) {
    //         return;
    //     }
    //     let newPos = cc.v2(this.pos.x, this.pos.y);
    //     switch (dir) {
    //         case 0: if (newPos.y + 1 < 9) { newPos.y++; } break;
    //         case 1: if (newPos.y - 1 >= 0) { newPos.y--; } break;
    //         case 2: if (newPos.x - 1 >= 0) { newPos.x--; this.isFaceRight = false; } break;
    //         case 3: if (newPos.x + 1 < 9) { newPos.x++; this.isFaceRight = true; } break;
    //     }
    //     this.isMoving = true;
    //     this.isAttacking = false;//取消攻击后摇
    //     this.pos = newPos;
    //     let isDown = dir == 1;
    //     if (isDown) {
    //         this.changeZIndex(this.pos);
    //     }
    //     let x = this.pos.x * 64 + 32;
    //     let y = this.pos.y * 64 + 32;
    //     let finish = cc.callFunc(() => {
    //         this.changeZIndex(this.pos);
    //         this.sprite.y = 0;
    //         this.isDied = false;
    //         this.sprite.rotation = 0;
    //         this.sprite.scale = 1;
    //         this.sprite.opacity = 255;
    //         this.anim.play('PlayerIdle');
    //         this.isMoving = false;
    //     }, this);
    //     //初始速度0.2,最大速度0.05 跨度0.15， 0.05减，最大300%
    //     let baseSpeed = 0.2;
    //     let action = cc.sequence(cc.moveTo(this.inventoryData.getMoveSpeed(baseSpeed), x, y), finish);
    //     this.anim.play('PlayerWalk');
    //     this.node.runAction(action);
    // }

    start() {
        let ss = this.node.getComponentsInChildren(cc.Sprite);
        for (let i = 0; i < ss.length; i++) {
            if (ss[i].spriteFrame) {
                ss[i].spriteFrame.getTexture().setAliasTexParameters();
            }
        }
        this.changeZIndex(this.pos);
        this.health = this.inventoryData.getHealth(this.health, Logic.playerData.basehealth.y);
        this.healthBar.refreshHealth(this.health.x, this.health.y);
    }
    fall() {
        if (this.isFall) {
            return;
        }
        this.isFall = true;
        this.anim.play('PlayerFall');
        setTimeout(() => {
            this.transportPlayer(cc.v2(4, 4));
            this.anim.play('PlayerIdle');
            this.takeDamage(1);
            this.isFall = false;
        }, 2000);
    }
    takeDamage(damage: number) {
        if (!this.healthBar) {
            return;
        }
        let d = this.inventoryData.getDamage(damage);
        let dodge = this.inventoryData.getDodge();
        let isDodge = Math.random() <= dodge;
        d = isDodge ? 0 : d;
        this.health = this.inventoryData.getHealth(this.health, Logic.playerData.basehealth.y);
        this.health.x -= d;
        if (this.health.x > this.health.y) {
            this.health.x = this.health.y;
        }
        this.healthBar.refreshHealth(this.health.x, this.health.y);
        Logic.playerData.basehealth.x = this.health.x;
        if (this.label) {
            this.label.node.opacity = 255;
            this.label.node.color = damage > 0 ? cc.color(255, 0, 0) : cc.color(0, 255, 0);
            this.label.string = `${parseFloat((-damage).toFixed(1))}`;
            if (isDodge) {
                this.label.node.color = cc.color(255, 255, 255);
                this.label.string = `miss`;
            }
            this.label.getComponent(cc.Animation).play('FontFloating');
        }
        if (this.health.x < 1) {
            this.killed();
        }
    }
    killed() {
        if (this.isDied) {
            return;
        }
        this.isDied = true;
        this.anim.play('PlayerDie');
        setTimeout(() => {
            cc.director.loadScene('gameover');
        }, 1000);
    }
    //玩家行动
    playerAction(dir: number, pos: cc.Vec2, dt: number, dungeon: Dungeon) {
        this.move(dir, pos, dt);
    }
    //30秒回复一次
    isRecoveryTimeDelay(dt: number): boolean {
        this.recoveryTimeDelay += dt;
        if (this.recoveryTimeDelay > 30) {
            this.recoveryTimeDelay = 0;
            return true;
        }
        return false;
    }
    update(dt) {
        if (!this.isMoving) {
            // this.updatePlayerPos();
        }
        if (this.isRecoveryTimeDelay(dt)) {
            let re = this.inventoryData.getRecovery();
            if (re > 0) {
                this.takeDamage(-re);
            }
        }

        this.node.scaleX = this.isFaceRight ? 1 : -1;
    }
    UseItem() {
        if (this.touchedEquipment && !this.touchedEquipment.isTaken) {
            this.touchedEquipment.taken();
            this.touchedEquipment = null;
        }
    }
    //anim
    AttackFinish() {
        this.isAttacking = false;

    }
    Attacking() {
        if (!this.attackTarget) {
            return;
        }
        let attackPoint = this.inventoryData.getAttackPoint(this.baseAttackPoint);
        let damage = this.inventoryData.getFinalAttackPoint(this.baseAttackPoint);
        //生命汲取
        let drain = this.inventoryData.getLifeDrain(this.baseAttackPoint);
        if (drain > 0) {
            this.takeDamage(-drain);
        }
        let monster = this.attackTarget.node.getComponent(Monster);
        if (monster && !monster.isDied) {
            monster.takeDamage(damage);
        }
        let kraken = this.attackTarget.node.getComponent(Kraken);
        if (kraken && !kraken.isDied) {
            kraken.takeDamage(damage, cc.v2(this.pos.x, this.pos.y + 1));
        }
    }
    onBeginContact(contact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let equipment = otherCollider.body.node.getComponent(Equipment);
        if (equipment) {
            this.touchedEquipment = equipment;
        }
    }
    onEndContact(contact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        this.touchedEquipment = null;
    }

}
