import type { Meta, StoryObj } from "@storybook/react";
import { MoviesList } from "./MoviesList";

const meta: Meta<typeof MoviesList> = {
  title: "Components/MoviesList",
  component: MoviesList,
  args: {
    heading: "Trending Movies",
    limit: 8,
  },
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof MoviesList>;

export const Default: Story = {};
