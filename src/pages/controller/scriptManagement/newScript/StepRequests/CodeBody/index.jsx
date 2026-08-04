import React, { useEffect, useState } from 'react';
import { connect } from 'umi';
import styles from './index.less';
import utils from '../../../utils';
import EditorControlled from '@/pages/controller/components/EditorControlled';
import { Button, Row } from 'antd';
import { useNodeField } from '@/pages/controller/hooks/useNodeField';

const CodeBody = (props) => {
    const {
        dispatch,
        scriptManagement: { stepTreeList, selectedNode, currentNodeInfo }
    } = props;
    const codeExampleList = [
        {
            name: '示例代码',
            code: `# Python代码步骤只支持定义一个函数，且不支持接口发送
import json
import random
import string

def hello_world():
    """示例代码"""
    def random_dict(n=5):
        """随机生成一个字典"""
        d = {}
        for _ in range(n):
            key = ''.join(random.choices(string.ascii_lowercase, k=5))
            value = random.randint(1, 100)
            d[key] = value
        return d
    v = random_dict(6)
    size = len(v)
    if isinstance(v, dict):
            v['size'] = size
            v['name'] = v.get('name', 'mcgeq')
            v['items'] = {f'{x}': x**x for x in range(2,12) if x % 2 ==0}
    return {'msg': 'hello', 'data': v }`
        }
    ];

    const [codeBody, setCodeBody] = useState('');
    // const [codeBody, setCodeBody] = useNodeField({
    //     dispatch,
    //     selectedNode,
    //     fieldKey: selectedNode?.nodeType === 6 ? 'code' : 'body',
    //     extrakeys: selectedNode?.nodeType === 6 ? [{key: 'request_args_type', valueFn: () => 'raw'}] : [],
    //     stepTreeList 
    // });

    useEffect(() => {
        if (selectedNode.nodeType == 6) {
            setCodeBody(selectedNode.code || '# Python代码步骤只支持定义一个函数，且不支持接口发送');
        } else {
            setCodeBody();
        }
    }, [selectedNode]);

    const handleEditorChange = (value, e) => {
        setCodeBody(e);
        if(selectedNode.nodeType == 6) {
            updateTreeList([{ insertKey: 'code', insertValue: e }, { insertKey: 'request_args_type', insertValue: 'raw' }]);
        } else {
            updateTreeList([{ insertKey: 'request_body', insertValue: e }]);
        }
    };
    
    const updateTreeList = (insertList) => {
        let finalList = utils.recurseTreeList(stepTreeList, insertList, selectedNode);
        dispatch({
            type: 'scriptManagement/syncStepTreeList',
            stepTreeList: finalList
        });
        let currentNode = recurseFindTreeNode(finalList);
        dispatch({
            type: 'scriptManagement/syncSelectedNode',
            selectedNode: currentNode
        });
    }

    //. 遍历树结构
    const recurseFindTreeNode = (treeList) => {
        let targetRow = {};
        if (!treeList || treeList.length == 0) return {};

        for (const item of treeList) {
            if (item.id === selectedNode.id) return item;

            if (Array.isArray(item.childNode) && item.childNode.length > 0) {
                targetRow = recurseFindTreeNode(item.childNode);
                if (targetRow?.id) return targetRow;
            }
        }

        return targetRow;
    };

    return (
        <div className={styles['code-body-content']} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '90%' }}>
                <EditorControlled  height="35vh" value={codeBody} handleChange={handleEditorChange} fontSize={16} />
            </div>
            <div style={{ width: '10%', marginTop: 6, marginLeft: 2, marginRight: 2 }}>
                {/* <Row gutter={[8, 8]} justify="center"><h3>代码片段</h3></Row> */}
                {codeExampleList.map(item => (<Row gutter={[8, 8]} justify="center">
                    <Button type='link' onClick={() => setCodeBody(item.code)}>{item.name}</Button>
                </Row>))}
            </div>
        </div>
    );
}

export default connect(({ scriptManagement }) => ({
    scriptManagement
}))(CodeBody);