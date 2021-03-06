// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


export default class BoxData {

    pos:cc.Vec2;
    defaultPos:cc.Vec2;
    position:cc.Vec2;
    valueCopy(data:BoxData){
        this.pos = data.pos?cc.v2(data.pos.x,data.pos.y):cc.v2(0,0);
        this.defaultPos = data.defaultPos?cc.v2(data.defaultPos.x,data.defaultPos.y):cc.v2(0,0);
        this.position = data.position?cc.v2(data.position.x,data.position.y):cc.v2(0,0);
    }
}
