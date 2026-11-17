import type { ColorValue } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Five tab icons only — geometry derived from Lucide (ISC licence).
 * A full icon library pulled 2.2 MB into the tab bundle; these cost ~2 KB total.
 */

export interface IconProps {
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
}

function base({ size = 24, color = '#000', strokeWidth = 2 }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Path d="M3 10.5 12 3l9 7.5" />
      <Path d="M5 9.5V21h14V9.5" />
      <Path d="M9.5 21v-6h5v6" />
    </Svg>
  );
}

export function CustomersIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

export function ProjectsIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <Path d="M8 10v4" />
      <Path d="M12 10v2" />
      <Path d="M16 10v6" />
    </Svg>
  );
}

export function DueIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
      <Path d="M16 2v4" />
      <Path d="M8 2v4" />
      <Path d="M3 10h5" />
      <Circle cx="17" cy="17" r="5" />
      <Path d="M17 14.5V17l1.8 1.2" />
    </Svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Svg>
  );
}
export function SearchIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Circle cx="11" cy="11" r="7" />
      <Path d="m20 20-3.6-3.6" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Path d="M18 6 6 18" />
      <Path d="m6 6 12 12" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Path d="m20 6-11 11-5-5" />
    </Svg>
  );
}

