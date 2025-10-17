import React from 'react';
import { View } from 'react-native';

interface SpacerProps {
  height?: number;
  width?: number;
}

export const Spacer: React.FC<SpacerProps> = ({ height, width }) => {
  const style: { height?: number; width?: number } = {};
  if (height) style.height = height;
  if (width) style.width = width;
  return <View style={style} />;
};

// Pre-defined spacers for common use cases
export const SpacerVertical = {
  XS: () => <Spacer height={4} />,
  SM: () => <Spacer height={8} />,
  MD: () => <Spacer height={16} />,
  LG: () => <Spacer height={24} />,
  XL: () => <Spacer height={32} />,
  XXL: () => <Spacer height={48} />,
};

export const SpacerHorizontal = {
  XS: () => <Spacer width={4} />,
  SM: () => <Spacer width={8} />,
  MD: () => <Spacer width={16} />,
  LG: () => <Spacer width={24} />,
  XL: () => <Spacer width={32} />,
  XXL: () => <Spacer width={48} />,
};

export default Spacer;
