import { Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import EditorControlled from '../../components/EditorControlled';

const { Paragraph } = Typography;

const JsonViewer = ({
    visible,
    jsonStr,
    data,
    parser = JSON.parse,
}) => {
    const parsed = useMemo(() => {
        if (!visible) return null;
        if (data != null && data != undefined) return data.req;
        if (!jsonStr) return null;
        try {
            return parser(jsonStr);
        } catch (err) {
            return { error: 'JSON解析失败' }
        }
    }, [visible, jsonStr, parser, data]);

    return (
        <Paragraph copyable={{ text: JSON.stringify(parsed, null, 2) || ''}}
            >
            {/* <JsonNode value={parsed} /> */}
            <EditorControlled language={data?.type} value={data?.type === 'json' ? JSON.stringify(parsed, null, 2) : parsed} readOnly={true} />
        </Paragraph>
    );
}

export default JsonViewer;