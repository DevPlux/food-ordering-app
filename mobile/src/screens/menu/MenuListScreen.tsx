import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { MenuStackParamList } from "../../navigation/types";
import { MenuItem } from "../../types/menuItem";
import { getMenuItems } from "../../api/menuService";
import MenuCard from "../../components/MenuCard";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import ErrorText from "../../components/ErrorText";

type Props = NativeStackScreenProps<MenuStackParamList, "MenuList">;

export default function MenuListScreen({ navigation }: Props) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchMenu = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // useFocusEffect runs every time the screen comes into view
  useFocusEffect(
    useCallback(() => {
      fetchMenu();
    }, []),
  );

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.center}>
          <ErrorText>{error}</ErrorText>
        </View>
      ) : items.length === 0 ? (
        <EmptyState message="No menu items available right now." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MenuCard
              item={item}
              onPress={() =>
                navigation.navigate("MenuDetail", { itemId: item._id })
              }
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchMenu(true)}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});
