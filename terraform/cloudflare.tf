# Cloudflare DNS configuration for custom domain

data "cloudflare_zone" "main" {
  filter = {
    name = var.domain_name
  }
}

# Frontend DNS record
resource "cloudflare_dns_record" "frontend" {
  zone_id = data.cloudflare_zone.main.zone_id
  name    = var.subdomain
  type    = "CNAME"
  content = "ghs.googlehosted.com"
  proxied = false # Required for Cloud Run SSL certificate provisioning
  ttl     = 1     # Auto TTL when not proxied
}

# Backend DNS record
resource "cloudflare_dns_record" "backend" {
  zone_id = data.cloudflare_zone.main.zone_id
  name    = "api.${var.subdomain}"
  type    = "CNAME"
  content = "ghs.googlehosted.com"
  proxied = false # Required for Cloud Run SSL certificate provisioning
  ttl     = 1     # Auto TTL when not proxied
}
