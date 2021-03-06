import Logic from "../Logic";
import Player from "../Player";
import DamageData from "../Data/DamageData";
import { EventConstant } from "../EventConstant";

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

@ccclass
export default class SlimeVenom extends cc.Component {
    venom1: cc.Node;
    venom2: cc.Node;
    venom3: cc.Node;
    player:Player;
    anim:cc.Animation;
    sprite:cc.Node;
    isHide = false;
    isForever = false;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.venom1 = this.node.getChildByName('sprite').getChildByName('venom1');
        this.venom2 = this.node.getChildByName('sprite').getChildByName('venom2');
        this.venom3 = this.node.getChildByName('sprite').getChildByName('venom2');
        this.anim = this.getComponent(cc.Animation);
        this.sprite = this.node.getChildByName('sprite');
    }

    onEnable() {
        this.isHide = false;
        this.sprite.opacity = 255;
        this.venom1.rotation = Logic.getRandomNum(0,180);
        this.venom2.rotation = Logic.getRandomNum(0,180);
        this.venom2.rotation = Logic.getRandomNum(0,180);
        this.anim.play();
        if(!this.isForever){
            setTimeout(()=>{
                if(this.anim){
                    this.isHide = true;
                    this.anim.play('VenomHide');
                    setTimeout(()=>{cc.director.emit('destoryvenom',{detail:{coinNode:this.node}});},1500);
                }
            },3000);
        }
        this.damagePlayer();
    }
    start() {

    }
    /**获取玩家距离 */
    getNearPlayerDistance(playerNode: cc.Node): number {
        let dis = Logic.getDistance(this.node.position, playerNode.position);
        return dis;
    }
    checkTimeDelay = 0;
    isCheckTimeDelay(dt: number): boolean {
        this.checkTimeDelay += dt;
        if (this.checkTimeDelay > 1) {
            this.checkTimeDelay = 0;
            return true;
        }
        return false;
    }
    update (dt) {
        if (this.isCheckTimeDelay(dt)) {
            this.damagePlayer();
        }
    }
    damagePlayer(){
        if (this.player&&this.getNearPlayerDistance(this.player.node)<60*this.node.scale&&this.node.active && !this.isHide) {
            let dd = new DamageData();
            dd.toxicDamage = 1;
            cc.director.emit(EventConstant.PLAYER_TAKEDAMAGE,{detail:{damage:dd}});
        }
    }
}
