import React from "react"
import Svg, { Path, SvgProps } from "react-native-svg";
import { useTheme } from "../../providers/ThemeProvider";

type Props = SvgProps & {
    color?: string;
};

export const TabBg: React.FC<Props> = () => {
    const { theme } = useTheme();

    return (
        <Svg
            width={75}
            height={50}
            viewBox="0 0 75 50"
        >
            <Path
                d="M75.2 0v61H0V0c4.1 0 7.4 3.1 7.9 7.1C10 21.7 22.5 33 37.7 33c15.2 0 27.7-11.3 29.7-25.9.5-4 3.9-7.1 7.9-7.1h-.1z"
                fill={theme.colors.surface}
            />
        </Svg>
    )
};
