"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Send, Users, Settings, Eye, Save, Download, Sparkles, Tag, User as UserIcon, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data for subscribers
const mockSubscribers = [
  { id: 1, email: "user1@example.com", name: "Alex Johnson", subscribed: "2024-01-15", status: "active" },
  { id: 2, email: "user2@example.com", name: "Maria Garcia", subscribed: "2024-01-20", status: "active" },
  { id: 3, email: "user3@example.com", name: "David Chen", subscribed: "2024-02-01", status: "active" },
  { id: 4, email: "user4@example.com", name: "Sarah Wilson", subscribed: "2024-02-10", status: "active" },
  { id: 5, email: "user5@example.com", name: "Mike Brown", subscribed: "2024-02-15", status: "active" },
]

export default function AdminSettings() {
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([])
  const [isSending, setIsSending] = useState(false)
  const [senderEmail, setSenderEmail] = useState("noreply@urban.com")
  const [emailPassword, setEmailPassword] = useState("")
  const [smtpServer, setSmtpServer] = useState("smtp.gmail.com")
  const [smtpPort, setSmtpPort] = useState("587")

  const handleSendEmail = async () => {
    if (!emailSubject || !emailContent) {
      alert("Please fill in both subject and content")
      return
    }

    setIsSending(true)

    // Simulate API call
    setTimeout(() => {
      alert(
        `Email sent to ${selectedSubscribers.length > 0 ? selectedSubscribers.length : mockSubscribers.length} subscribers!`,
      )
      setEmailSubject("")
      setEmailContent("")
      setSelectedSubscribers([])
      setIsSending(false)
    }, 2000)
  }

  const toggleSubscriber = (id: number) => {
    setSelectedSubscribers((prev) => (prev.includes(id) ? prev.filter((subId) => subId !== id) : [...prev, id]))
  }

  const selectAllSubscribers = () => {
    setSelectedSubscribers(mockSubscribers.map((sub) => sub.id))
  }

  const clearSelection = () => {
    setSelectedSubscribers([])
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-streetwear-lg">STORE SETTINGS</h1>
            <p className="text-muted-foreground">Manage your store configuration and email marketing</p>
          </div>
        </div>

        <Tabs defaultValue="email-marketing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="email-marketing" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Marketing
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          {/* Email Marketing Tab */}
          <TabsContent value="email-marketing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  CREATE EMAIL CAMPAIGN
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject..."
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your email content here..."
                    className="min-h-[200px]"
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {previewMode ? "Edit Mode" : "Preview"}
                  </Button>

                  <Button
                    onClick={handleSendEmail}
                    disabled={isSending || !emailSubject || !emailContent}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSending ? "Sending..." : "Send Email"}
                  </Button>
                </div>

                {previewMode && (
                  <Card className="border-2 border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg">Email Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <strong>Subject:</strong> {emailSubject || "No subject"}
                        </div>
                        <Separator />
                        <div className="whitespace-pre-wrap">{emailContent || "No content"}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    EMAIL SUBSCRIBERS ({mockSubscribers.length})
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllSubscribers}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedSubscribers.length > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>{selectedSubscribers.length}</strong> subscribers selected for next email campaign
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {mockSubscribers.map((subscriber) => (
                      <div
                        key={subscriber.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedSubscribers.includes(subscriber.id)
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => toggleSubscriber(subscriber.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedSubscribers.includes(subscriber.id)}
                            onChange={() => toggleSubscriber(subscriber.id)}
                            className="rounded"
                          />
                          <div>
                            <p className="font-medium">{subscriber.name}</p>
                            <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{subscriber.status}</Badge>
                          <span className="text-sm text-muted-foreground">{subscriber.subscribed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <AutoCouponSettings />
            <CouponManager />
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  GENERAL SETTINGS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" defaultValue="URBAN" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-email">Store Email</Label>
                  <Input id="store-email" type="email" defaultValue="admin@urban.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-description">Store Description</Label>
                  <Textarea id="store-description" defaultValue="Premium streetwear for the urban lifestyle" />
                </div>

                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  EMAIL CONFIGURATION
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sender-email">Sender Email</Label>
                  <Input
                    id="sender-email"
                    type="email"
                    placeholder="noreply@urban.com"
                    defaultValue="noreply@urban.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-password">Email Password</Label>
                  <Input
                    id="email-password"
                    type="password"
                    placeholder="Enter email password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-server">SMTP Server</Label>
                    <Input
                      id="smtp-server"
                      placeholder="smtp.gmail.com"
                      defaultValue="smtp.gmail.com"
                      value={smtpServer}
                      onChange={(e) => setSmtpServer(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      placeholder="587"
                      defaultValue="587"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> These credentials will be used to send marketing emails to your subscribers.
                    Make sure to use an app-specific password for Gmail or the appropriate credentials for your email
                    provider.
                  </p>
                </div>

                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Email Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function CouponManager() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    type: "percentage" as "percentage" | "fixed_amount" | "free_shipping",
    value: 10,
    minimumAmount: "",
    usageLimit: "",
    startsAt: "",
    expiresAt: "",
    code: "",
    prefix: "",
    userId: "",
    isGeneral: false,
  })

  const fetchList = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/admin/coupons")
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || `Error ${res.status}`)
      setList(json.data || [])
    } catch (e: any) {
      setError(e.message || "Error cargando cupones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList() }, [])

  const updateField = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const create = async () => {
    try {
      setCreating(true)
      setError(null)
      const payload: any = {
        type: form.type,
        value: Number(form.value),
      }
      if (form.minimumAmount) payload.minimumAmount = Number(form.minimumAmount)
      if (form.usageLimit) payload.usageLimit = Number(form.usageLimit)
      if (form.startsAt) payload.startsAt = new Date(form.startsAt)
      if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt)
      if (form.code) payload.code = form.code
      if (form.prefix) payload.prefix = form.prefix
      if (!form.isGeneral && form.userId) payload.userId = form.userId
      const res = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || `Error ${res.status}`)
      setForm({ type: "percentage", value: 10, minimumAmount: "", usageLimit: "", startsAt: "", expiresAt: "", code: "", prefix: "", userId: "", isGeneral: false })
      await fetchList()
    } catch (e: any) {
      setError(e.message || "Error creando cupón")
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || `Error ${res.status}`)
      await fetchList()
    } catch (e) {}
  }

  const linkUser = async (id: string, userOrId: string | null) => {
    try {
      const body = userOrId ? { user: userOrId } : { userId: null }
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || `Error ${res.status}`)
      await fetchList()
    } catch (e) {}
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || `Error ${res.status}`)
      await fetchList()
    } catch (e) {}
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> CREAR CUPÓN</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={form.type} onValueChange={(v) => updateField("type", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Porcentaje</SelectItem>
                <SelectItem value="fixed_amount">Monto fijo</SelectItem>
                <SelectItem value="free_shipping">Envío gratis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input type="number" value={form.value} onChange={(e) => updateField("value", Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Mínimo</Label>
            <Input type="number" placeholder="Opcional" value={form.minimumAmount} onChange={(e) => updateField("minimumAmount", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Límite de uso</Label>
            <Input type="number" placeholder="Opcional" value={form.usageLimit} onChange={(e) => updateField("usageLimit", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Inicio</Label>
            <Input type="datetime-local" value={form.startsAt} onChange={(e) => updateField("startsAt", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Expira</Label>
            <Input type="datetime-local" value={form.expiresAt} onChange={(e) => updateField("expiresAt", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Código (opcional)</Label>
            <Input value={form.code} onChange={(e) => updateField("code", e.target.value)} placeholder="ABCD-EFGH-IJKL" />
          </div>
          <div className="space-y-2">
            <Label>Prefijo (opcional)</Label>
            <Input value={form.prefix} onChange={(e) => updateField("prefix", e.target.value)} placeholder="SALE" />
          </div>
          <div className="space-y-2">
            <Label>Usuario (UUID o email)</Label>
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <Input value={form.userId} onChange={(e) => updateField("userId", e.target.value)} placeholder="uuid o email del usuario" disabled={form.isGeneral} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>General (todos pueden usar)</Label>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.isGeneral} onCheckedChange={(v) => updateField("isGeneral", Boolean(v))} />
              <span className="text-sm text-muted-foreground">Si está activo, no se vincula a usuario</span>
            </div>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button onClick={create} disabled={creating} className="flex items-center gap-2"><Tag className="h-4 w-4" /> {creating ? "Creando..." : "Crear cupón"}</Button>
          </div>
          {error && <div className="md:col-span-3 text-sm text-red-500">{error}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LISTA DE CUPONES</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando cupones...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Mínimo</TableHead>
                  <TableHead>Uso</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead className="w-[160px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.code}</TableCell>
                    <TableCell className="text-muted-foreground">{c.type}</TableCell>
                    <TableCell className="text-muted-foreground">{c.value}</TableCell>
                    <TableCell className="text-muted-foreground">{c.minimumAmount ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.usedCount}/{c.usageLimit ?? "∞"}</TableCell>
                    <TableCell>
                      <Button variant={c.isActive ? "outline" : "default"} size="sm" onClick={() => toggleActive(c.id, c.isActive)}>
                        {c.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input className="max-w-[220px]" placeholder="uuid o email" defaultValue={c.userId ?? ""} onBlur={(e) => linkUser(c.id, e.currentTarget.value || null)} />
                        <Button variant="outline" size="sm" onClick={() => linkUser(c.id, null)}>Hacer general</Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.startsAt ? new Date(c.startsAt).toLocaleString() : "-"} → {c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="destructive" size="sm" onClick={() => remove(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">No hay cupones aún.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
function AutoCouponSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [state, setState] = useState({
    enabled: false,
    type: "percentage" as "percentage" | "fixed_amount" | "free_shipping",
    value: 10,
    minimumAmount: "",
    prefix: "WELCOME",
    expiresInDays: "30",
  })

  const setField = (k: string, v: any) => setState(prev => ({ ...prev, [k]: v }))

  useEffect(() => {
    let ignore = false
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/admin/app-settings')
        const json = await res.json()
        if (!ignore && res.ok && json?.success) {
          const v = json.data?.newUserCoupon || null
          if (v) {
            setState({
              enabled: Boolean(v.enabled),
              type: v.type || "percentage",
              value: Number(v.value ?? 10),
              minimumAmount: v.minimumAmount != null ? String(v.minimumAmount) : "",
              prefix: v.prefix || "WELCOME",
              expiresInDays: v.expiresInDays != null ? String(v.expiresInDays) : "30",
            })
          }
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Error cargando configuración')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchSettings()
    return () => { ignore = true }
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      setError(null)
      setOk(null)
      const payload = {
        newUserCoupon: {
          enabled: Boolean(state.enabled),
          type: state.type,
          value: Number(state.value),
          minimumAmount: state.minimumAmount ? Number(state.minimumAmount) : undefined,
          prefix: state.prefix || undefined,
          expiresInDays: state.expiresInDays ? Number(state.expiresInDays) : undefined,
        }
      }
      const res = await fetch('/api/admin/app-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || `Error ${res.status}`)
      setOk('Configuración guardada')
    } catch (e: any) {
      setError(e?.message || 'Error guardando configuración')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> CUPÓN AUTOMÁTICO NUEVOS USUARIOS
          <Badge className={loading ? "" : (state.enabled ? "bg-green-600 text-white" : "bg-muted text-muted-foreground")}> 
            {loading ? 'Cargando…' : (state.enabled ? 'Activo' : 'Inactivo')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-3">
          <Label>Activar</Label>
          <div className="flex items-center gap-2">
            <Checkbox checked={state.enabled} onCheckedChange={(v) => setField('enabled', Boolean(v))} />
            <span className="text-sm text-muted-foreground">Si está activo, se emitirá un cupón al registrarse</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={state.type} onValueChange={(v) => setField('type', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Porcentaje</SelectItem>
              <SelectItem value="fixed_amount">Monto fijo</SelectItem>
              <SelectItem value="free_shipping">Envío gratis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Valor</Label>
          <Input type="number" value={state.value} onChange={(e) => setField('value', Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Mínimo</Label>
          <Input type="number" placeholder="Opcional" value={state.minimumAmount} onChange={(e) => setField('minimumAmount', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Prefijo código</Label>
          <Input value={state.prefix} onChange={(e) => setField('prefix', e.target.value)} placeholder="WELCOME" />
        </div>
        <div className="space-y-2">
          <Label>Expira en días</Label>
          <Input type="number" placeholder="Opcional" value={state.expiresInDays} onChange={(e) => setField('expiresInDays', e.target.value)} />
        </div>
        <div className="md:col-span-3 flex justify-end gap-3">
          {error && <div className="text-sm text-red-500">{error}</div>}
          {ok && <div className="text-sm text-green-600">{ok}</div>}
          <Button onClick={save} disabled={saving || loading} className="flex items-center gap-2"><Save className="h-4 w-4" /> {saving ? 'Guardando...' : 'Guardar configuración'}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
