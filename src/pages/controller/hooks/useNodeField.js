import { useEffect, useState } from "react";
import utils from "../scriptManagement/utils";

export function useNodeField({ dispatch, selectedNode, fieldKey, extrakeys = [], stepTreeList }) {
    const [value, setValue] = useState();
    useEffect(() => {
        setValue(selectedNode?.[fieldKey] ?? undefined);
    }, [selectedNode, fieldKey]);

    const onChange = (e) => {
        const newValue =  typeof e === 'object' && e !== null && 'target' in e ? e?.target?.value : e;
        setValue(newValue);

        const insertList = [
            { insertKey: fieldKey, insertValue: newValue },
            ...extrakeys.map(({key, valueFn}) => ({
                insertKey: key,
                insertValue: valueFn ? valueFn(newValue) : newValue
            }))
        ];
        update(newValue, insertList);
    };

    const update = (value, insertList) => {
        const finalList = utils.recurseTreeList(stepTreeList, insertList, selectedNode);
        dispatch({
            type: 'scriptManagement/syncStepTreeList',
            stepTreeList: finalList
        });

        dispatch({
            type: 'scriptManagement/syncSelectedNode',
            selectedNode: {
                ...selectedNode,
                [fieldKey]: value,
                ...extrakeys.reduce((acc, { key }) => {
                    acc[key] = value;
                    return acc;
                }, {})
            }
        });
    };
    return [value, onChange];
}