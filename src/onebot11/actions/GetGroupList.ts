import { OB11Group } from '../types';
import { OB11Constructor } from "../constructor";
import { groups } from "../../common/data";
import BaseAction from "./BaseAction";
import { ActionName } from "./types";



class GetGroupList extends BaseAction<null, OB11Group[]> {
    actionName = ActionName.GetGroupList

    protected async _handle(payload: null){
        return OB11Constructor.groups(groups);
    }
}

export default GetGroupList