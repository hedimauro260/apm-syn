import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Pencil, Trash2, MoreHorizontal, Save, Check, WalletCards, RefreshCw } from "lucide-react";
import { setTheme } from "@/lib/theme";

export function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">APM SYN</h1>
          <p className="text-foreground-secondary">Design System — Component Playground</p>
        </div>

        {/* Theme Toggle */}
        <div className="flex gap-2 justify-center">
          <Button variant="ghost" onClick={() => setTheme("dark")}>Dark</Button>
          <Button variant="ghost" onClick={() => setTheme("light")}>Light</Button>
        </div>

        {/* BUTTONS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Buttons</h2>

          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">Variants</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">Sizes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">States</p>
            <div className="flex flex-wrap gap-3">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Saving...</Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">With Icons</p>
            <div className="flex flex-wrap gap-3">
              <Button><Save className="h-4 w-4" /> Save</Button>
              <Button variant="danger"><Trash2 className="h-4 w-4" /> Delete</Button>
            </div>
          </div>
        </section>

        <Separator />

        {/* ICON BUTTONS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Icon Buttons</h2>

          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">Sizes</p>
            <div className="flex flex-wrap items-center gap-3">
              <IconButton size="sm" aria-label="Edit"><Pencil /></IconButton>
              <IconButton size="md" aria-label="Edit"><Pencil /></IconButton>
              <IconButton size="lg" aria-label="Edit"><Pencil /></IconButton>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">Variants</p>
            <div className="flex flex-wrap gap-3">
              <IconButton variant="primary" aria-label="Save"><Save /></IconButton>
              <IconButton variant="secondary" aria-label="Edit"><Pencil /></IconButton>
              <IconButton variant="outline" aria-label="More"><MoreHorizontal /></IconButton>
              <IconButton variant="ghost" aria-label="More"><MoreHorizontal /></IconButton>
              <IconButton variant="danger" aria-label="Delete"><Trash2 /></IconButton>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">States</p>
            <div className="flex flex-wrap gap-3">
              <IconButton aria-label="Check"><Check /></IconButton>
              <IconButton disabled aria-label="Check"><Check /></IconButton>
              <IconButton loading aria-label="Saving" />
            </div>
          </div>
        </section>

        <Separator />

        {/* BADGES */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Badges</h2>

          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">Variants</p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="danger">Failed</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">Sizes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">With Dot</p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success" dot>Active</Badge>
              <Badge variant="warning" dot>Pending</Badge>
              <Badge variant="danger" dot>Failed</Badge>
            </div>
          </div>
        </section>

        <Separator />

        {/* SPINNER */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Spinner</h2>

          <div className="flex flex-wrap items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </section>

        <Separator />

        {/* FORMS */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Forms</h2>

          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-name">Wallet name</Label>
              <Input id="wallet-name" name="name" placeholder="Main Wallet" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-desc">Description</Label>
              <Input id="wallet-desc" name="description" placeholder="Personal wallet" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-type">Type</Label>
              <Select id="wallet-type" name="type" defaultValue="BANK">
                <option value="BANK">Bank</option>
                <option value="CASH">Cash</option>
                <option value="DIGITAL_WALLET">Digital Wallet</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-notes">Notes</Label>
              <Textarea id="wallet-notes" name="notes" placeholder="Additional notes..." rows={3} />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="counts-goal" name="countsGoal" />
              <Label htmlFor="counts-goal">Count toward goal</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="disabled-check" disabled />
              <Label htmlFor="disabled-check">Disabled option</Label>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">States</p>
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="normal-input">Normal</Label>
                <Input id="normal-input" placeholder="Normal input" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disabled-input">Disabled</Label>
                <Input id="disabled-input" placeholder="Disabled input" disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="error-input">Error</Label>
                <Input id="error-input" placeholder="Invalid value" aria-invalid />
                <p className="text-sm text-danger">This field is required.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="readonly-input">Read Only</Label>
                <Input id="readonly-input" value="Read only value" readOnly />
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* CARDS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Cards</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Current portfolio value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="tabular-nums text-2xl font-bold">$128,492.42</div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">View details</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wallets</CardTitle>
                <CardDescription>3 active wallets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Main Bank</span>
                    <span className="tabular-nums font-medium">$45,230.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Cash</span>
                    <span className="tabular-nums font-medium">$1,250.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Digital</span>
                    <span className="tabular-nums font-medium">$82,011.92</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">Manage wallets</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <Separator />

        {/* SEPARATOR */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Separator</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground-secondary mb-2">Horizontal</p>
              <Separator />
            </div>

            <div>
              <p className="text-sm text-foreground-secondary mb-2">Vertical</p>
              <div className="flex items-center gap-4 h-8">
                <span>Wallets</span>
                <Separator orientation="vertical" />
                <span>Transactions</span>
                <Separator orientation="vertical" />
                <span>Goals</span>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* ALERTS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Alerts</h2>

          <div className="space-y-3">
            <Alert variant="info">
              <AlertTitle>Market data updated</AlertTitle>
              <AlertDescription>Portfolio values have been refreshed with the latest prices.</AlertDescription>
            </Alert>

            <Alert variant="success">
              <AlertTitle>Wallet created</AlertTitle>
              <AlertDescription>Your new wallet has been successfully created.</AlertDescription>
            </Alert>

            <Alert variant="warning">
              Market data may be delayed. Prices could be up to 15 minutes old.
            </Alert>

            <Alert variant="danger">
              <AlertTitle>Withdrawal failed</AlertTitle>
              <AlertDescription>Unable to process the withdrawal. Please try again later.</AlertDescription>
            </Alert>
          </div>
        </section>

        <Separator />

        {/* FEEDBACK STATES */}
        <section className="space-y-8">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Feedback States</h2>

          {/* Loading */}
          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">Loading</p>
            <Card>
              <CardContent className="p-0">
                <LoadingState>Loading wallets...</LoadingState>
              </CardContent>
            </Card>
          </div>

          {/* Empty */}
          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">Empty</p>
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={<WalletCards className="h-12 w-12" />}
                  title="No wallets yet"
                  description="Create your first wallet to start tracking your assets."
                  action={<Button>Create wallet</Button>}
                />
              </CardContent>
            </Card>
          </div>

          {/* Error */}
          <div className="space-y-3">
            <p className="text-sm text-foreground-secondary">Error</p>
            <Card>
              <CardContent className="p-0">
                <ErrorState
                  title="Unable to load wallets"
                  description="Something went wrong while fetching your data."
                  action={<Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Try again</Button>}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Design Tokens */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Design Tokens</h2>

          <div className="space-y-4">
            <div className="flex gap-4 justify-center flex-wrap">
              <div className="w-24 h-24 bg-background border border-border rounded-lg flex items-center justify-center text-xs">
                background
              </div>
              <div className="w-24 h-24 bg-surface border border-border rounded-lg flex items-center justify-center text-xs">
                surface
              </div>
              <div className="w-24 h-24 bg-surface-elevated border border-border rounded-lg flex items-center justify-center text-xs shadow-md">
                elevated
              </div>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <div className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">primary</div>
              <div className="px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium">success</div>
              <div className="px-4 py-2 bg-warning text-warning-foreground rounded-lg text-sm font-medium">warning</div>
              <div className="px-4 py-2 bg-danger text-danger-foreground rounded-lg text-sm font-medium">danger</div>
              <div className="px-4 py-2 bg-info text-info-foreground rounded-lg text-sm font-medium">info</div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-4 inline-block">
              <p className="text-sm text-foreground-secondary mb-2">Financial Numbers (tabular-nums)</p>
              <div className="tabular-nums text-2xl font-bold space-y-1">
                <div>$ 10.00</div>
                <div>$ 125.50</div>
                <div>$ 1,250.00</div>
                <div>$ 12,500.00</div>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center pt-4 border-t border-border">
          <Link to="/app">
            <Button>Open App</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
