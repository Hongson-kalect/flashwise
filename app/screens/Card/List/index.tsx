import { AppContainer } from "@/components/AppContainer";
import { AppDivider } from "@/components/AppDivider";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import { ScrollView, StyleSheet, View } from "react-native";
import ListHeader from "./components/header";
import CardList from "./components/list";
import ItemListHeader from "./components/listHeader";
import ListSumary from "./components/sumary";

export default function CardPage() {
  return (
    <View className="flex-1">
      <View className="px-2">
        <ListHeader />
      </View>

      <View className="mt-1">
        <AppDivider />
      </View>
      <ScrollView>
        <AppContainer>
          <View className="mt-4">
            <ListSumary />
          </View>

          <View className="mt-16">
            <ItemListHeader isSelecting={false} />
          </View>

          <View className="mt-4">
            <CardList />
          </View>

          <AppTitle title="Chức năng chính"></AppTitle>

          <View className="px-2">
            <AppText>Title và add button</AppText>

            <AppText>
              Panel Hiển thị thống kê đơn giản về số lương từ trong danh sách.
            </AppText>

            <AppText>
              Card filter / Bottom sheet với các mục: Layout, modal check
              collections, created by, sort, lang, target_lang, favorite,
            </AppText>

            <AppText>Search input name / tags / description</AppText>
            <AppText>Số lượng card tìm thấy</AppText>

            <AppText>Hiển thị danh sách card</AppText>
          </View>
        </AppContainer>
        <View className="h-10"></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({});
