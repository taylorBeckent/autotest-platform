const { Card } = require("antd");
const { Chart, Coord, Axis, Geom, Legend } = require("bizcharts");
const { useState, useEffect, useMemo } = require("react");
import DataSet from '@antv/data-set';


const BizPieChart = ({
    title = '',
    data = [],
    valueField = 'value',
    categoryField = 'type',
    colorField= 'color',
    height = 360,
    radius = 0.75,
    innerRadius = 0.65
}) => {
    const [dv, setDv] = useState(null);
    const [total, setTotal] = useState(0);
    const [centerText, setCenterText] = useState({
        title: '已完成',
        value: 0,
    });

    const legendItems = useMemo(() => {
        if (!data.length) return [];
        const totalValue = data.reduce((t, i) => t + i[valueField], 0);
        return data.map(item => {
            const percent = ((item[valueField] / totalValue) * 100).toFixed(1);
            return {
                value: item[categoryField],
                color: item[colorField],
                label: `${item[categoryField]} ${percent}%`
            }
        })
    }, [data, valueField, categoryField, colorField]);

    useEffect(() => {
        if (!data.length) return;

        const sum = data.reduce((t, i) => t + i[valueField], 0);
        setTotal(sum);
        setCenterText({title: '已完成', value: sum});
        const ds = new DataSet();
        const view = ds.createView().source(data);

        view.transform({
            type: 'percent',
            field: valueField,
            dimension: categoryField,
            as: 'percent',
        });
        const cols = {
            percent: {
                formatter: val => {
                    val = val * 100 + '%';
                    return val;
                }
            }
        };
        setDv(view);
    }, [data, valueField, categoryField]);

    const scale = {
        percent: {
            formatter: (val) => `${(val * 100).toFixed(1)}%`,
        },
    };
    return (
        // <Card title={title} bordered={false}>
            <div style={{ position: 'relative', height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    zIndex: 2
                }}>
                    <div style={{ fontSize: 12, color: '#999'}}>
                        {centerText.title}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 600}}>
                        {typeof centerText.value === 'number' ? centerText.value.toLocaleString() : centerText.value}
                    </div>
                </div>
                {!dv ? (
                    <div style={{ textAlign: 'center', paddingTop: (height - 24) / 2}}>加载中...</div>
                ) : (
                    <Chart
                        height={height * 0.9}
                        data={dv}
                        scale={scale}
                        forceFit
                        onTooltipChange={(evt) => {
                            const item = evt.items?.[0];
                            if (item) {
                                setCenterText({
                                    title: item.name,
                                    value: `${(item.percent * 100).toFixed(1)}%`,
                                });
                            }
                        }}
                        onTooltipHide={() => {
                            setCenterText({title: '已完成', value: total});
                        }}
                        >
                            <Coord
                                type="theta"
                                radius={radius}
                                innerRadius={innerRadius}
                            />
                            <Axis name="percent" visible={false} />
                            <Axis name={categoryField} visible={false} />

                            <Legend
                                position='right-center'
                                textStyle={{ fontSize: 12, fill: '#666'}}
                                marker={{
                                    symbol: 'square',
                                    style: {
                                        r: 4
                                    }
                                }}
                                custom={true}
                                items={legendItems}
                            />
                            <Geom
                                type="interval"
                                position="percent"
                                color={colorField || categoryField}
                                adjust="stack"
                            />
                        </Chart>
                )}
            </div>
        // </Card>
    );
};

export default BizPieChart;