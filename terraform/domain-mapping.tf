# Cloud Run domain mappings for custom domains

resource "google_cloud_run_domain_mapping" "frontend" {
  name     = "${var.subdomain}.${var.domain_name}"
  location = var.region

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.frontend.name
  }

  depends_on = [cloudflare_dns_record.frontend]
}

resource "google_cloud_run_domain_mapping" "backend" {
  name     = "api.${var.subdomain}.${var.domain_name}"
  location = var.region

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.backend.name
  }

  depends_on = [cloudflare_dns_record.backend]
}
