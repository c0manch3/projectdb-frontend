#!/bin/bash

################################################################################
# Health Check Script
# Verifies that the frontend application is running correctly
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PRODUCTION_URL="https://lencondb.ru"
LOCAL_URL="http://localhost:8080"
HEALTH_ENDPOINT="/health"

echo -e "${YELLOW}=== Frontend Health Check ===${NC}\n"

# Function to check URL
check_url() {
    local url=$1
    local name=$2

    echo -e "${YELLOW}Checking $name...${NC}"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        echo -e "${GREEN}✓ $name is accessible (HTTP $HTTP_CODE)${NC}"
        return 0
    else
        echo -e "${RED}✗ $name is not accessible (HTTP $HTTP_CODE)${NC}"
        return 1
    fi
}

# Function to check health endpoint
check_health() {
    local url=$1
    local name=$2

    echo -e "${YELLOW}Checking $name health endpoint...${NC}"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${url}${HEALTH_ENDPOINT}" 2>/dev/null)

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ $name health check passed${NC}"
        return 0
    else
        echo -e "${RED}✗ $name health check failed (HTTP $HTTP_CODE)${NC}"
        return 1
    fi
}

# Function to check Docker container
check_container() {
    echo -e "${YELLOW}Checking Docker container...${NC}"

    if docker ps | grep -q projectdb-frontend; then
        echo -e "${GREEN}✓ Docker container is running${NC}"

        # Get container stats
        CONTAINER_ID=$(docker ps -qf "name=projectdb-frontend")
        echo -e "\n${YELLOW}Container Info:${NC}"
        docker ps --filter "name=projectdb-frontend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

        return 0
    else
        echo -e "${RED}✗ Docker container is not running${NC}"
        return 1
    fi
}

# Function to check nginx
check_nginx() {
    echo -e "${YELLOW}Checking Nginx...${NC}"

    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✓ Nginx is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Nginx is not running${NC}"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl() {
    local domain=$1

    echo -e "${YELLOW}Checking SSL certificate for $domain...${NC}"

    CERT_INFO=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)

    if [ -n "$CERT_INFO" ]; then
        echo -e "${GREEN}✓ SSL certificate is valid${NC}"
        echo "$CERT_INFO"
        return 0
    else
        echo -e "${RED}✗ SSL certificate check failed${NC}"
        return 1
    fi
}

# Main health checks
ERRORS=0

# Check local container
if command -v docker &> /dev/null; then
    check_container || ((ERRORS++))
    echo ""
fi

# Check nginx
if command -v systemctl &> /dev/null; then
    check_nginx || ((ERRORS++))
    echo ""
fi

# Check local URL
check_url "$LOCAL_URL" "Local frontend" || ((ERRORS++))
echo ""

# Check local health endpoint
check_health "$LOCAL_URL" "Local frontend" || ((ERRORS++))
echo ""

# Check production URL
check_url "$PRODUCTION_URL" "Production frontend" || ((ERRORS++))
echo ""

# Check production health endpoint
check_health "$PRODUCTION_URL" "Production frontend" || ((ERRORS++))
echo ""

# Check SSL certificate
if command -v openssl &> /dev/null; then
    check_ssl "lencondb.ru" || ((ERRORS++))
    echo ""
fi

# Summary
echo -e "${YELLOW}=== Summary ===${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS health check(s) failed${NC}"
    exit 1
fi
