import { ContainerPropsType } from '../container';
import { TextPropsType } from '../text';

/** Empty props type. */
export type EmptyPropsType = Omit<ContainerPropsType, 'as'>;

/** Empty icon props type. */
export type EmptyIconPropsType = ContainerPropsType;

/** Empty title props type. */
export type EmptyTitlePropsType = Omit<TextPropsType, 'as'>;

/** Empty description props type. */
export type EmptyDescriptionPropsType = Omit<TextPropsType, 'as' | 'variant'>;

/** Empty action props type. */
export type EmptyActionPropsType = ContainerPropsType;
