import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, FileText, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

const WorkLogListPage = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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

  const filteredLogs = workLogs?.filter((log) => {
    const matchesKeyword = !searchKeyword || 
      log.work_details.toLowerCase().includes(searchKeyword.toLowerCase());
    
    const logDate = new Date(log.log_date);
    const matchesDateRange = !dateRange?.from || 
      (logDate >= dateRange.from && (!dateRange.to || logDate <= dateRange.to));

    return matchesKeyword && matchesDateRange;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">日誌一覧</h1>
        <p className="text-muted-foreground mt-2">記録した作業日誌を確認できます</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>検索・絞り込み</CardTitle>
          <CardDescription>日付範囲やキーワードで絞り込めます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="作業内容で検索..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full md:w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "yyyy/MM/dd")} -{" "}
                        {format(dateRange.to, "yyyy/MM/dd")}
                      </>
                    ) : (
                      format(dateRange.from, "yyyy/MM/dd")
                    )
                  ) : (
                    "日付範囲を選択"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {(searchKeyword || dateRange) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchKeyword("");
                  setDateRange(undefined);
                }}
              >
                クリア
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">読み込み中...</p>
            </CardContent>
          </Card>
        ) : filteredLogs && filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
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
                          {format(new Date(log.log_date), "yyyy年MM月dd日")}
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
                      {log.work_details.length > 50
                        ? log.work_details.substring(0, 50) + "..."
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
                {searchKeyword || dateRange
                  ? "検索条件に一致する日誌がありません"
                  : "まだ日誌が記録されていません"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkLogListPage;
