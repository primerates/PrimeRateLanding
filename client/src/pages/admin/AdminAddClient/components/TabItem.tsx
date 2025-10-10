import { TabsTrigger } from '@/components/ui/tabs';

interface TabData {
  value: string;
  label: string;
  testId: string;
}

interface TabItemProps {
  tab: TabData;
}

const TAB_TRIGGER_CLASSES = "relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0";

const TabItem = ({ tab }: TabItemProps) => {
  return (
    <TabsTrigger
      value={tab.value}
      data-testid={tab.testId}
      className={TAB_TRIGGER_CLASSES}
    >
      {tab.label}
    </TabsTrigger>
  );
};

export default TabItem;