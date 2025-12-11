import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import {
  Server,
  Database,
  Globe,
  CreditCard,
  Mail,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Wifi,
  Trash2,
  Terminal,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { systemAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"

const systemServices = [
  {
    id: "server",
    name: "Server Status",
    icon: Server,
    status: "operational",
    metrics: {
      uptime: "99.9%",
      uptimeDays: "45 days",
      cpu: 32,
      memory: 68,
      responseTime: "45ms",
    },
    lastChecked: new Date().toISOString(),
  },
  {
    id: "database",
    name: "Database",
    icon: Database,
    status: "operational",
    metrics: {
      connections: "Active",
      queryTime: "12ms",
      storage: "2.4GB / 10GB",
      storagePercent: 24,
    },
    lastChecked: new Date().toISOString(),
  },
  {
    id: "api",
    name: "API Gateway",
    icon: Globe,
    status: "operational",
    metrics: {
      responseTime: "89ms",
      errorRate: "0.02%",
      requests: "12.4k/hr",
    },
    lastChecked: new Date().toISOString(),
  },
  {
    id: "payment",
    name: "Payment Gateway",
    icon: CreditCard,
    status: "operational",
    metrics: {
      successRate: "99.8%",
      lastTransaction: "2 min ago",
      provider: "Stripe",
    },
    lastChecked: new Date().toISOString(),
  },
  {
    id: "email",
    name: "Email Service",
    icon: Mail,
    status: "degraded",
    metrics: {
      deliveryRate: "94.2%",
      sentToday: "1,234",
      queue: "23 pending",
    },
    lastChecked: new Date().toISOString(),
  },
  {
    id: "cdn",
    name: "CDN / Assets",
    icon: Wifi,
    status: "operational",
    metrics: {
      cacheHitRate: "98.5%",
      bandwidth: "45.2GB",
      latency: "12ms",
    },
    lastChecked: new Date().toISOString(),
  },
]

const recentAlerts = [
  {
    id: 1,
    severity: "warning",
    message: "Email delivery rate dropped below 95%",
    time: "5 minutes ago",
    resolved: false,
  },
  {
    id: 2,
    severity: "info",
    message: "Scheduled maintenance completed successfully",
    time: "2 hours ago",
    resolved: true,
  },
  {
    id: 3,
    severity: "critical",
    message: "High CPU usage detected on web server",
    time: "3 hours ago",
    resolved: true,
  },
  {
    id: 4,
    severity: "warning",
    message: "Database connection pool reaching limit",
    time: "5 hours ago",
    resolved: true,
  },
]

// Icon mapping for services
const serviceIcons = {
  server: Server,
  database: Database,
  api: Globe,
  payment: CreditCard,
  email: Mail,
  cdn: Wifi,
}

const statusConfig = {
  operational: { label: "Operational", color: "text-success", bgColor: "bg-success", icon: CheckCircle },
  degraded: { label: "Degraded", color: "text-warning", bgColor: "bg-warning", icon: AlertTriangle },
  outage: { label: "Outage", color: "text-destructive", bgColor: "bg-destructive", icon: XCircle },
}

const alertSeverityConfig = {
  critical: { color: "bg-destructive/10 text-destructive border-destructive/20" },
  warning: { color: "bg-warning/10 text-warning border-warning/20" },
  info: { color: "bg-info/10 text-info border-info/20" },
}

export default function AdminSystemPage() {
  const { error: showError } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [alertFilter, setAlertFilter] = useState("all")
  const [systemServices, setSystemServices] = useState([])
  const [recentAlerts, setRecentAlerts] = useState([])
  const [responseTimeData, setResponseTimeData] = useState([])
  const [requestVolumeData, setRequestVolumeData] = useState([])
  const [systemInfo, setSystemInfo] = useState(null)

  useEffect(() => {
    const fetchSystemData = async () => {
      setIsLoading(true)
      try {
        const [health, alerts, performance] = await Promise.all([
          systemAPI.getHealth().catch(() => ({ services: [], systemInfo: null })),
          systemAPI.getAlerts().catch(() => []),
          systemAPI.getPerformance().catch(() => ({ responseTime: [], requestVolume: [] })),
        ])

        setSystemServices(health.services || [])
        setSystemInfo(health.systemInfo)
        setRecentAlerts(alerts || [])
        setResponseTimeData(performance.responseTime || [])
        setRequestVolumeData(performance.requestVolume || [])
        setLastRefresh(new Date())
      } catch (err) {
        console.error("Failed to fetch system data:", err)
        showError("Failed to load system data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSystemData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemData, 30000)
    return () => clearInterval(interval)
  }, [showError])

  const overallStatus = systemServices.some((s) => s.status === "outage")
    ? "outage"
    : systemServices.some((s) => s.status === "degraded")
      ? "degraded"
      : "operational"

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const [health, alerts, performance] = await Promise.all([
        systemAPI.getHealth().catch(() => ({ services: [], systemInfo: null })),
        systemAPI.getAlerts().catch(() => []),
        systemAPI.getPerformance().catch(() => ({ responseTime: [], requestVolume: [] })),
      ])

      setSystemServices(health.services || [])
      setSystemInfo(health.systemInfo)
      setRecentAlerts(alerts || [])
      setResponseTimeData(performance.responseTime || [])
      setRequestVolumeData(performance.requestVolume || [])
      setLastRefresh(new Date())
    } catch (err) {
      showError("Failed to refresh system data")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAlerts = alertFilter === "all" ? recentAlerts : recentAlerts.filter((a) => a.severity === alertFilter)

  return (
    <>
      <Helmet>
        <title>System Status - BuyPoint Admin</title>
        <meta name="description" content="System status and monitoring" />
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">System Status</h1>
            <p className="text-muted-foreground">Monitor system health and performance</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Last updated: {lastRefresh.toLocaleTimeString()}</span>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <Card
          className={`border-2 ${statusConfig[overallStatus].color.replace("text-", "border-")}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`h-4 w-4 rounded-full ${statusConfig[overallStatus].bgColor} animate-pulse`}
                />
                <div>
                  <h2 className="text-xl font-bold">
                    {overallStatus === "operational"
                      ? "All Systems Operational"
                      : overallStatus === "degraded"
                        ? "Some Systems Degraded"
                        : "System Outage Detected"}
                  </h2>
                  <p className="text-muted-foreground">
                    {systemServices.filter((s) => s.status === "operational").length} of {systemServices.length} services
                    operational
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-lg py-1 px-3 ${statusConfig[overallStatus].color}`}
              >
                {statusConfig[overallStatus].label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Service Status Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : systemServices.length > 0 ? (
            systemServices.map((service) => {
              const status = statusConfig[service.status]
              const IconComponent = serviceIcons[service.id] || Server
              return (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${status.color.replace("text-", "bg-")}/10`}
                        >
                          <IconComponent className={`h-5 w-5 ${status.color}`} />
                        </div>
                      <div>
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${status.bgColor}`} />
                          <span className={`text-xs ${status.color}`}>{status.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.id === "server" && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">CPU Usage</span>
                          <span>{service.metrics.cpu}%</span>
                        </div>
                        <Progress value={service.metrics.cpu} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Memory</span>
                          <span>{service.metrics.memory}%</span>
                        </div>
                        <Progress value={service.metrics.memory} className="h-2" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{service.metrics.uptimeDays}</span>
                      </div>
                    </>
                  )}
                  {service.id === "database" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Connection</span>
                        <Badge variant="outline" className="text-success">
                          {service.metrics.connections}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Query Time</span>
                        <span className="font-medium">{service.metrics.queryTime}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Storage</span>
                          <span>{service.metrics.storage}</span>
                        </div>
                        <Progress value={service.metrics.storagePercent} className="h-2" />
                      </div>
                    </>
                  )}
                  {service.id === "api" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Response Time</span>
                        <span className="font-medium">{service.metrics.responseTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Error Rate</span>
                        <span className="font-medium text-success">{service.metrics.errorRate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Requests</span>
                        <span className="font-medium">{service.metrics.requests}</span>
                      </div>
                    </>
                  )}
                  {service.id === "payment" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium text-success">{service.metrics.successRate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Transaction</span>
                        <span className="font-medium">{service.metrics.lastTransaction}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Provider</span>
                        <Badge variant="outline">{service.metrics.provider}</Badge>
                      </div>
                    </>
                  )}
                  {service.id === "email" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Rate</span>
                        <span className="font-medium text-warning">{service.metrics.deliveryRate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sent Today</span>
                        <span className="font-medium">{service.metrics.sentToday}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Queue</span>
                        <span className="font-medium">{service.metrics.queue}</span>
                      </div>
                    </>
                  )}
                  {service.id === "cdn" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cache Hit Rate</span>
                        <span className="font-medium text-success">{service.metrics.cacheHitRate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bandwidth</span>
                        <span className="font-medium">{service.metrics.bandwidth}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Latency</span>
                        <span className="font-medium">{service.metrics.latency}</span>
                      </div>
                    </>
                  )}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No system services data available
            </div>
          )}
        </div>

        {/* Performance Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Time (24h)</CardTitle>
              <CardDescription>Average API response time in milliseconds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : responseTimeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" interval={3} />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`${value}ms`, "Response Time"]}
                    />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No response time data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Volume (24h)</CardTitle>
              <CardDescription>Number of API requests per hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : requestVolumeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={requestVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" interval={3} />
                    <YAxis className="text-xs" tickFormatter={(value) => `${value / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`${value.toLocaleString()}`, "Requests"]}
                    />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--success))"
                        fill="hsl(var(--success))"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No request volume data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent system events and alerts</CardDescription>
            </div>
            <Select value={alertFilter} onValueChange={setAlertFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${alertSeverityConfig[alert.severity].color}`}
                >
                  <div className="flex items-center gap-3">
                    {alert.severity === "critical" ? (
                      <XCircle className="h-5 w-5" />
                    ) : alert.severity === "warning" ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      <Activity className="h-5 w-5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs opacity-80">{alert.time}</p>
                    </div>
                  </div>
                  {alert.resolved ? (
                    <Badge variant="outline" className="text-success border-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolved
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline">
                      Mark Resolved
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common system maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Trash2 className="h-4 w-4" />
                Clear Cache
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                Restart Services
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Terminal className="h-4 w-4" />
                View Logs
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                <ExternalLink className="h-4 w-4" />
                Health Check
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

