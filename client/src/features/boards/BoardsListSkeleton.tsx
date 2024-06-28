import BoardItem from './BoardItem';

type Props = {
  count?: number;
};

const BoardsListSkeleton = ({ count = 2 }: Props) => {
  return Array.from({ length: count }, (_, i) => (
    <BoardItem
      key={i}
      title=""
      favorited={false}
      slug=""
      id=""
      skeleton={true}
    />
  ));
};

export default BoardsListSkeleton;
