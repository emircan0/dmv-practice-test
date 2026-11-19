import React from "react";
import { View, Text } from "react-native";
import Svg, { Path, Circle, Text as SvgText, G } from "react-native-svg";
export function SpeedometerGauge({
  score,
  color,
  label,
  hasData = true,
}: {
  score: number;
  color: string;
  label: string;
  hasData?: boolean;
}) {
  const SIZE = 220;
  const cx = SIZE / 2;
  const cy = SIZE / 2 + 16;
  const R = 78;
  const strokeW = 13;
  const needleLen = 64;

  const START_ANGLE = 210;
  const TOTAL_ARC = 240;

  const polarToXY = (angleDeg: number, r: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (startDeg: number, endDeg: number, r: number) => {
    const s = polarToXY(startDeg, r);
    const e = polarToXY(endDeg, r);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const bgPath = arcPath(START_ANGLE, START_ANGLE + TOTAL_ARC, R);
  const redPath = arcPath(START_ANGLE, START_ANGLE + TOTAL_ARC * 0.4, R);
  const yelPath = arcPath(
    START_ANGLE + TOTAL_ARC * 0.4,
    START_ANGLE + TOTAL_ARC * 0.7,
    R,
  );
  const grnPath = arcPath(
    START_ANGLE + TOTAL_ARC * 0.7,
    START_ANGLE + TOTAL_ARC,
    R,
  );
  const fillPath = arcPath(
    START_ANGLE,
    Math.max(START_ANGLE + 0.5, START_ANGLE + (score / 100) * TOTAL_ARC),
    R,
  );

  // İğne — üçgen polygon
  const needleAngleDeg = START_ANGLE + (score / 100) * TOTAL_ARC;
  const needleRad = ((needleAngleDeg - 90) * Math.PI) / 180;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);
  const tailLen = 12;
  const tx = cx - tailLen * Math.cos(needleRad);
  const ty = cy - tailLen * Math.sin(needleRad);
  const perpRad = needleRad + Math.PI / 2;
  const hw = 2.8;
  const p1x = cx + hw * Math.cos(perpRad);
  const p1y = cy + hw * Math.sin(perpRad);
  const p2x = cx - hw * Math.cos(perpRad);
  const p2y = cy - hw * Math.sin(perpRad);

  // 0 / 50 / 100 etiketleri
  const labels = [
    { val: "0", pos: polarToXY(START_ANGLE, R + 20) },
    { val: "50", pos: polarToXY(START_ANGLE + TOTAL_ARC / 2, R + 20) },
    { val: "100", pos: polarToXY(START_ANGLE + TOTAL_ARC, R + 20) },
  ];

  // SVG yüksekliği: yayın alt ortasından hub'a kadar yeterli
  const svgH = cy + 18;

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={SIZE} height={svgH} viewBox={`0 0 ${SIZE} ${svgH}`}>
        {/* Arka plan yayı */}
        <Path
          d={bgPath}
          stroke="#f1f5f9"
          strokeWidth={strokeW}
          fill="none"
          strokeLinecap="round"
        />

        {/* Soluk bölge renkleri */}
        <Path
          d={redPath}
          stroke="#fecaca"
          strokeWidth={strokeW}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={yelPath}
          stroke="#fde68a"
          strokeWidth={strokeW}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={grnPath}
          stroke="#bbf7d0"
          strokeWidth={strokeW}
          fill="none"
          strokeLinecap="round"
        />

        {/* Canlı değer yayı */}
        <Path
          d={fillPath}
          stroke={color}
          strokeWidth={strokeW}
          fill="none"
          strokeLinecap="round"
        />

        {/* Etiketler */}
        {labels.map(({ val, pos }) => (
          <SvgText
            key={val}
            x={pos.x}
            y={pos.y + 4}
            textAnchor="middle"
            fontSize={9}
            fontWeight="700"
            fill="#94a3b8"
          >
            {val}
          </SvgText>
        ))}

        {/* İğne gölgesi */}
        <G opacity={0.1}>
          <Path
            d={`M ${nx + 1} ${ny + 1} L ${p1x + 1} ${p1y + 1} L ${tx + 1} ${ty + 1} L ${p2x + 1} ${p2y + 1} Z`}
            fill="#000"
          />
        </G>

        {/* İğne (üçgen) */}
        <Path
          d={`M ${nx} ${ny} L ${p1x} ${p1y} L ${tx} ${ty} L ${p2x} ${p2y} Z`}
          fill={color}
        />

        {/* Hub: dış gri halka, ana daire, iç beyaz */}
        <Circle cx={cx} cy={cy} r={13} fill="#e2e8f0" />
        <Circle cx={cx} cy={cy} r={10} fill={color} />
        <Circle cx={cx} cy={cy} r={4} fill="white" />
      </Svg>

      {/* Skor + label — SVG dışında, temiz */}
      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Text
          style={{
            fontSize: 34,
            fontWeight: "900",
            color,
            lineHeight: 38,
            letterSpacing: -1,
          }}
        >
          {hasData ? `${score}%` : "—"}
        </Text>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: "#94a3b8",
            marginTop: 2,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
