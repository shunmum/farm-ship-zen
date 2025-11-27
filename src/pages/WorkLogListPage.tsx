import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Search,
  FileText,
  MessageSquare,
  TrendingUp,
  Calendar as CalendarView,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth as dateFnsIsSameMonth,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ja } from "date-fns/locale";

type ViewMode = "timeline" | "comparison" | "list";
type TimelineSubView = "calendar" | "gantt";

const WorkLogListPage = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>("comparison");
  const [timelineSubView, setTimelineSubView] = useState<TimelineSubView>("calendar");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { data: workLogs, isLoading } = useQuery({
    queryKey: ["work-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_logs")
        .select("*")
        .order("log_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // 利用可能な年のリスト
  const availableYears = useMemo(() => {
    if (!workLogs) return [];
    const years = new Set(
      workLogs.map((log) => new Date(log.log_date).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [workLogs]);

  // 選択された年のデータ
  const currentYearLogs = useMemo(() => {
    if (!workLogs) return [];
    return workLogs.filter((log) => {
      const logYear = new Date(log.log_date).getFullYear();
      return logYear === selectedYear;
    });
  }, [workLogs, selectedYear]);

  // 前年のデータ
  const previousYearLogs = useMemo(() => {
    if (!workLogs) return [];
    return workLogs.filter((log) => {
      const logYear = new Date(log.log_date).getFullYear();
      return logYear === selectedYear - 1;
    });
  }, [workLogs, selectedYear]);

  // 月ごとにグループ化
  const groupByMonth = (logs: typeof workLogs) => {
    if (!logs) return {};
    const grouped: Record<number, typeof logs> = {};
    logs.forEach((log) => {
      const month = new Date(log.log_date).getMonth();
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(log);
    });
    return grouped;
  };

  const currentYearByMonth = useMemo(
    () => groupByMonth(currentYearLogs),
    [currentYearLogs]
  );

  const previousYearByMonth = useMemo(
    () => groupByMonth(previousYearLogs),
    [previousYearLogs]
  );

  // 検索フィルター
  const filteredCurrentYear = currentYearLogs?.filter((log) =>
    !searchKeyword ||
    log.work_details.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    log.field.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const filteredPreviousYear = previousYearLogs?.filter((log) =>
    !searchKeyword ||
    log.work_details.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    log.field.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const months = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ];

  // カレンダービュー用のヘルパー関数
  const getCalendarDays = () => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const calendarStart = startOfWeek(monthStart, { locale: ja });
    const calendarEnd = endOfWeek(monthEnd, { locale: ja });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const getLogsForDay = (day: Date) => {
    if (!currentYearLogs) return [];
    return currentYearLogs.filter((log) =>
      isSameDay(parseISO(log.log_date), day)
    );
  };

  // ガントチャートビュー用：圃場ごとにグループ化
  const logsByField = useMemo(() => {
    if (!currentYearLogs) return {};
    const grouped: Record<string, typeof currentYearLogs> = {};
    currentYearLogs.forEach((log) => {
      if (!grouped[log.field]) {
        grouped[log.field] = [];
      }
      grouped[log.field].push(log);
    });
    return grouped;
  }, [currentYearLogs]);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">作業日誌</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            過去の記録を振り返って、今年の作業に活かしましょう
          </p>
        </div>

        {/* 年選択 */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md bg-background text-foreground"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今年の記録</p>
                <p className="text-2xl font-bold">{filteredCurrentYear?.length || 0}件</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">昨年の記録</p>
                <p className="text-2xl font-bold">{filteredPreviousYear?.length || 0}件</p>
              </div>
              <CalendarView className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">前年比</p>
                <p className="text-2xl font-bold">
                  {filteredPreviousYear?.length
                    ? Math.round(
                        ((filteredCurrentYear?.length || 0) /
                          filteredPreviousYear.length) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 検索バー */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="圃場名や作業内容で検索..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* ビュー切り替えタブ */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
          <TabsTrigger value="comparison">年次比較</TabsTrigger>
          <TabsTrigger value="timeline">タイムライン</TabsTrigger>
          <TabsTrigger value="list">一覧表示</TabsTrigger>
        </TabsList>

        {/* 年次比較ビュー */}
        <TabsContent value="comparison" className="space-y-6 mt-6">
          {months.map((monthName, monthIndex) => {
            const currentMonthLogs = currentYearByMonth[monthIndex] || [];
            const previousMonthLogs = previousYearByMonth[monthIndex] || [];

            if (currentMonthLogs.length === 0 && previousMonthLogs.length === 0) {
              return null;
            }

            return (
              <Card key={monthIndex}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{monthName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 今年 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default">{selectedYear}年</Badge>
                        <span className="text-sm text-muted-foreground">
                          {currentMonthLogs.length}件
                        </span>
                      </div>
                      <div className="space-y-2">
                        {currentMonthLogs.length > 0 ? (
                          currentMonthLogs.map((log) => (
                            <div
                              key={log.id}
                              onClick={() => navigate(`/work-logs/${log.id}`)}
                              className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-muted-foreground">
                                      {format(parseISO(log.log_date), "M/d")}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {log.field}
                                    </Badge>
                                  </div>
                                  <p className="text-sm line-clamp-2">{log.work_details}</p>
                                </div>
                                {log.input_type === "manual" ? (
                                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                ) : (
                                  <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            記録なし
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 去年 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{selectedYear - 1}年</Badge>
                        <span className="text-sm text-muted-foreground">
                          {previousMonthLogs.length}件
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
                      </div>
                      <div className="space-y-2">
                        {previousMonthLogs.length > 0 ? (
                          previousMonthLogs.map((log) => (
                            <div
                              key={log.id}
                              onClick={() => navigate(`/work-logs/${log.id}`)}
                              className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors opacity-75"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-muted-foreground">
                                      {format(parseISO(log.log_date), "M/d")}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {log.field}
                                    </Badge>
                                  </div>
                                  <p className="text-sm line-clamp-2">{log.work_details}</p>
                                </div>
                                {log.input_type === "manual" ? (
                                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                ) : (
                                  <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            記録なし
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {Object.keys(currentYearByMonth).length === 0 &&
            Object.keys(previousYearByMonth).length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CalendarView className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground">
                    {selectedYear}年と{selectedYear - 1}年の記録がありません
                  </p>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        {/* タイムラインビュー */}
        <TabsContent value="timeline" className="mt-6 space-y-4">
          {/* サブビュー切り替え */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Button
                  variant={timelineSubView === "calendar" ? "default" : "outline"}
                  onClick={() => setTimelineSubView("calendar")}
                  className="flex-1"
                >
                  <CalendarView className="h-4 w-4 mr-2" />
                  カレンダー表示
                </Button>
                <Button
                  variant={timelineSubView === "gantt" ? "default" : "outline"}
                  onClick={() => setTimelineSubView("gantt")}
                  className="flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  ガントチャート
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* カレンダービュー */}
          {timelineSubView === "calendar" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-lg">
                    {format(calendarMonth, "yyyy年M月", { locale: ja })}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* カレンダーグリッド */}
                <div className="grid grid-cols-7 gap-1">
                  {/* 曜日ヘッダー */}
                  {["日", "月", "火", "水", "木", "金", "土"].map((day, idx) => (
                    <div
                      key={day}
                      className={`text-center text-xs font-semibold p-2 ${
                        idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : ""
                      }`}
                    >
                      {day}
                    </div>
                  ))}

                  {/* カレンダーの日付 */}
                  {getCalendarDays().map((day, idx) => {
                    const logsForDay = getLogsForDay(day);
                    const isCurrentMonth = dateFnsIsSameMonth(day, calendarMonth);
                    const dayOfWeek = getDay(day);

                    return (
                      <div
                        key={idx}
                        className={`min-h-20 border rounded p-1 ${
                          isCurrentMonth ? "bg-background" : "bg-muted/30"
                        } ${
                          dayOfWeek === 0
                            ? "border-red-200"
                            : dayOfWeek === 6
                            ? "border-blue-200"
                            : ""
                        }`}
                      >
                        <div
                          className={`text-xs font-medium mb-1 ${
                            !isCurrentMonth ? "text-muted-foreground" : ""
                          } ${
                            dayOfWeek === 0
                              ? "text-red-500"
                              : dayOfWeek === 6
                              ? "text-blue-500"
                              : ""
                          }`}
                        >
                          {format(day, "d")}
                        </div>

                        {/* その日の作業 */}
                        <div className="space-y-0.5">
                          {logsForDay.slice(0, 3).map((log) => (
                            <div
                              key={log.id}
                              onClick={() => navigate(`/work-logs/${log.id}`)}
                              className="text-xs p-1 bg-primary/10 hover:bg-primary/20 rounded cursor-pointer truncate"
                              title={`${log.field}: ${log.work_details}`}
                            >
                              <div className="font-medium truncate">{log.field}</div>
                            </div>
                          ))}
                          {logsForDay.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{logsForDay.length - 3}件
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ガントチャートビュー */}
          {timelineSubView === "gantt" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedYear}年 作業ガントチャート
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(logsByField).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {selectedYear}年の記録がありません
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* 月のヘッダー */}
                    <div className="flex border-b pb-2">
                      <div className="w-32 font-semibold text-sm">圃場</div>
                      <div className="flex-1 flex">
                        {months.map((month, idx) => (
                          <div
                            key={idx}
                            className="flex-1 text-center text-xs font-medium border-l px-1"
                          >
                            {month}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 各圃場の作業タイムライン */}
                    {Object.entries(logsByField).map(([field, logs]) => (
                      <div key={field} className="flex items-start">
                        <div className="w-32 font-medium text-sm py-2 truncate" title={field}>
                          {field}
                        </div>
                        <div className="flex-1 flex relative">
                          {/* 月の区切り線 */}
                          {months.map((_, idx) => (
                            <div key={idx} className="flex-1 border-l min-h-12 relative">
                              {/* その月の作業をドット表示 */}
                              {logs
                                .filter(
                                  (log) =>
                                    new Date(log.log_date).getMonth() === idx
                                )
                                .map((log) => {
                                  const day = new Date(log.log_date).getDate();
                                  const position = (day / 31) * 100;
                                  return (
                                    <div
                                      key={log.id}
                                      onClick={() => navigate(`/work-logs/${log.id}`)}
                                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full cursor-pointer hover:scale-150 transition-transform"
                                      style={{ left: `${position}%` }}
                                      title={`${format(parseISO(log.log_date), "M/d")}: ${
                                        log.work_details.substring(0, 30)
                                      }`}
                                    />
                                  );
                                })}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 一覧表示ビュー */}
        <TabsContent value="list" className="space-y-4 mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">読み込み中...</p>
              </CardContent>
            </Card>
          ) : filteredCurrentYear && filteredCurrentYear.length > 0 ? (
            filteredCurrentYear.map((log) => (
              <Card
                key={log.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => navigate(`/work-logs/${log.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">
                            {format(parseISO(log.log_date), "yyyy年MM月dd日")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {log.input_type === "manual" ? (
                            <>
                              <FileText className="h-3.5 w-3.5" />
                              <span>手動入力</span>
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>AI入力</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        圃場: {log.field}
                      </div>
                      <p className="text-foreground">
                        {log.work_details.length > 100
                          ? log.work_details.substring(0, 100) + "..."
                          : log.work_details}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  {searchKeyword
                    ? "検索条件に一致する日誌がありません"
                    : `${selectedYear}年の記録がありません`}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkLogListPage;
